const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 儲存課堂數據
const classrooms = new Map();
const reactions = new Map();
// 每個課堂的投票倒數計時器
const pollTimers = new Map(); // key: classroomId, value: timeoutId

// 靜態文件服務
// 簡單請求紀錄，協助診斷（可視需要保留或移除）
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.static('public'));
app.use(express.json());

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 健康檢查端點，供雲端平台檢測
app.get('/health', (req, res) => {
    res.status(200).send('ok');
});

app.get('/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

// API 路由
app.post('/api/classroom/create', (req, res) => {
    const classroomId = uuidv4().substring(0, 8);
    const classroom = {
        id: classroomId,
        name: req.body.name || '未命名課堂',
        createdAt: new Date(),
        students: 0,
        reactions: [],
        activePoll: null
    };
    
    classrooms.set(classroomId, classroom);
    res.json({ success: true, classroomId, classroom });
});

app.get('/api/classroom/:id', (req, res) => {
    const classroom = classrooms.get(req.params.id);
    if (classroom) {
        res.json({ success: true, classroom });
    } else {
        res.status(404).json({ success: false, message: '課堂不存在' });
    }
});

// WebSocket 連接處理
io.on('connection', (socket) => {
    console.log('用戶連接:', socket.id);

    // 加入課堂
    socket.on('join-classroom', (data) => {
        const { classroomId, userType, userName } = data;
        const classroom = classrooms.get(classroomId);
        
        if (classroom) {
            socket.join(classroomId);
            socket.classroomId = classroomId;
            socket.userType = userType;
            socket.userName = userName;
            
            if (userType === 'student') {
                classroom.students++;
                // 通知教師有新學生加入
                socket.to(classroomId).emit('student-joined', {
                    studentCount: classroom.students,
                    studentName: userName
                });
            }
            
            socket.emit('joined-classroom', { 
                success: true, 
                classroom,
                studentCount: classroom.students,
                activePoll: classroom.activePoll
            });
            
            console.log(`${userType} ${userName} 加入課堂 ${classroomId}`);
        } else {
            socket.emit('joined-classroom', { 
                success: false, 
                message: '課堂不存在' 
            });
        }
    });

    // 處理學生反應
    socket.on('student-reaction', (data) => {
        const { type, message } = data;
        const classroomId = socket.classroomId;
        const userName = socket.userName;
        
        if (classroomId && socket.userType === 'student') {
            const reaction = {
                id: uuidv4(),
                type,
                message,
                studentName: userName,
                timestamp: new Date(),
                resolved: false
            };
            
            const classroom = classrooms.get(classroomId);
            if (classroom) {
                classroom.reactions.push(reaction);
                
                // 即時發送給教師
                socket.to(classroomId).emit('new-reaction', reaction);
                
                console.log(`學生反應: ${userName} - ${type}: ${message}`);
            }
        }
    });

    // 教師建立投票
    socket.on('create-poll', (data) => {
        const classroomId = socket.classroomId;
        if (!classroomId || socket.userType !== 'teacher') return;

        const classroom = classrooms.get(classroomId);
        if (!classroom) return;

        const { question, options } = data || {};
        let { durationSec } = data || {};
        if (!question || !Array.isArray(options) || options.length < 2) {
            socket.emit('poll-error', { message: '投票至少需要問題與兩個選項' });
            return;
        }
        durationSec = parseInt(durationSec, 10);
        if (!Number.isFinite(durationSec) || durationSec <= 0) {
            durationSec = 60; // 預設 60 秒
        }

        // 建立新的投票
        const pollId = uuidv4().substring(0, 8);
        const poll = {
            id: pollId,
            question: String(question).trim(),
            options: options.map((text, idx) => ({ id: `${idx+1}`, text: String(text).trim(), count: 0 })),
            votesByStudent: {}, // key: socket.id, value: optionId
            startedAt: new Date(),
            ended: false,
            durationSec,
            endsAt: new Date(Date.now() + durationSec * 1000)
        };

        classroom.activePoll = poll;
        // 清理既有倒數，啟動新的倒數
        if (pollTimers.has(classroomId)) {
            clearTimeout(pollTimers.get(classroomId));
            pollTimers.delete(classroomId);
        }
        const timeoutId = setTimeout(() => {
            // 安全檢查：課堂/投票仍存在且未結束
            const cls = classrooms.get(classroomId);
            if (!cls || !cls.activePoll || cls.activePoll.ended) return;
            cls.activePoll.ended = true;
            cls.activePoll.endedAt = new Date();
            io.to(classroomId).emit('poll-ended', sanitizePollForClients(cls.activePoll));
            pollTimers.delete(classroomId);
        }, durationSec * 1000);
        pollTimers.set(classroomId, timeoutId);

        io.to(classroomId).emit('poll-started', sanitizePollForClients(poll));
    });

    // 學生提交投票
    socket.on('submit-vote', (data) => {
        const classroomId = socket.classroomId;
        if (!classroomId || socket.userType !== 'student') return;
        const classroom = classrooms.get(classroomId);
        if (!classroom || !classroom.activePoll || classroom.activePoll.ended) return;

        const poll = classroom.activePoll;
        const voterId = socket.id; // 以連線識別，避免重複投票
        const { optionId } = data || {};
        const option = poll.options.find(o => o.id === String(optionId));
        if (!option) return;

        if (poll.votesByStudent[voterId]) {
            // 已投過票，忽略（如需支援改票，可在此調整計數）
            return;
        }

        poll.votesByStudent[voterId] = option.id;
        option.count += 1;

        io.to(classroomId).emit('poll-updated', sanitizePollForClients(poll));
    });

    // 教師結束投票
    socket.on('end-poll', () => {
        const classroomId = socket.classroomId;
        if (!classroomId || socket.userType !== 'teacher') return;
        const classroom = classrooms.get(classroomId);
        if (!classroom || !classroom.activePoll) return;

        classroom.activePoll.ended = true;
        classroom.activePoll.endedAt = new Date();
        // 清除倒數計時器
        if (pollTimers.has(classroomId)) {
            clearTimeout(pollTimers.get(classroomId));
            pollTimers.delete(classroomId);
        }
        io.to(classroomId).emit('poll-ended', sanitizePollForClients(classroom.activePoll));
    });

    // 教師清除投票
    socket.on('clear-poll', () => {
        const classroomId = socket.classroomId;
        if (!classroomId || socket.userType !== 'teacher') return;
        const classroom = classrooms.get(classroomId);
        if (!classroom) return;
        classroom.activePoll = null;
        // 清除倒數計時器
        if (pollTimers.has(classroomId)) {
            clearTimeout(pollTimers.get(classroomId));
            pollTimers.delete(classroomId);
        }
        io.to(classroomId).emit('poll-cleared');
    });

    // 教師標記反應已處理
    socket.on('resolve-reaction', (data) => {
        const { reactionId } = data;
        const classroomId = socket.classroomId;
        
        if (classroomId && socket.userType === 'teacher') {
            const classroom = classrooms.get(classroomId);
            if (classroom) {
                const reaction = classroom.reactions.find(r => r.id === reactionId);
                if (reaction) {
                    reaction.resolved = true;
                    reaction.resolvedAt = new Date();
                    
                    // 通知所有人反應已處理
                    io.to(classroomId).emit('reaction-resolved', { reactionId });
                }
            }
        }
    });

    // 教師清空所有反應
    socket.on('clear-reactions', () => {
        const classroomId = socket.classroomId;
        
        if (classroomId && socket.userType === 'teacher') {
            const classroom = classrooms.get(classroomId);
            if (classroom) {
                classroom.reactions = [];
                io.to(classroomId).emit('reactions-cleared');
            }
        }
    });

    // 斷線處理
    socket.on('disconnect', () => {
        if (socket.classroomId && socket.userType === 'student') {
            const classroom = classrooms.get(socket.classroomId);
            if (classroom) {
                classroom.students--;
                socket.to(socket.classroomId).emit('student-left', {
                    studentCount: classroom.students,
                    studentName: socket.userName
                });
            }
        }
        console.log('用戶斷線:', socket.id);
    });
});

// 僅回傳可公開的投票資料（不含 votesByStudent 明細）
function sanitizePollForClients(poll) {
    if (!poll) return null;
    const totalVotes = Object.keys(poll.votesByStudent || {}).length;
    return {
        id: poll.id,
        question: poll.question,
        options: poll.options.map(o => ({ id: o.id, text: o.text, count: o.count })),
        totalVotes,
        startedAt: poll.startedAt,
        ended: !!poll.ended,
        endedAt: poll.endedAt || null,
        durationSec: poll.durationSec || null,
        endsAt: poll.endsAt || null,
        serverTime: new Date()
    };
}

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`上課反應系統運行中，位於 ${HOST}:${PORT}`);
    console.log('教師端: /teacher');
    console.log('學生端: /student');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});