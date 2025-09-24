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

// 靜態文件服務
app.use(express.static('public'));
app.use(express.json());

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
        reactions: []
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
                studentCount: classroom.students 
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`上課反應系統運行在 http://localhost:${PORT}`);
    console.log('教師端: http://localhost:' + PORT + '/teacher');
    console.log('學生端: http://localhost:' + PORT + '/student');
});