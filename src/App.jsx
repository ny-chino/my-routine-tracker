import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('schedule'); // 'schedule' | 'task' | 'report'
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'calendar'
  const [selectedDateStr, setSelectedDateStr] = useState('2026/10/21');

  // 日付送り (ヘッダーの ◀ ▶)
  const handleShiftDate = (direction) => {
    const parts = selectedDateStr.split('/').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + direction);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}/${m}/${day}`);
  };

  // 月送り (カレンダー表示時の ◀ ▶)
  const handleShiftMonth = (direction) => {
    const parts = selectedDateStr.split('/').map(Number);
    const d = new Date(parts[0], parts[1] - 1 + direction, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(parts[2]).padStart(2, '0');
    setSelectedDateStr(`${y}/${m}/${day}`);
  };

  // タイムラインピン
  const [pinPercent, setPinPercent] = useState(45);
  const timelineBarRef = useRef(null);
  const scheduleContainerRef = useRef(null);
  const scheduleItemRefs = useRef({});
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const percent = Math.max(0, Math.min(100, ((currentMins - 360) / (1440 - 360)) * 100));
    setPinPercent(percent);
  }, []);

  const handleScheduleScroll = () => {
    if (isUserScrollingRef.current) return;
    const container = scheduleContainerRef.current;
    if (!container) return;

    const containerTop = container.getBoundingClientRect().top;
    let closestItem = currentSchedules[0];
    let minDistance = Infinity;

    currentSchedules.forEach((item) => {
      const el = scheduleItemRefs.current[item.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - containerTop);
        if (dist < minDistance) {
          minDistance = dist;
          closestItem = item;
        }
      }
    });

    if (closestItem) {
      const percent = Math.max(0, Math.min(100, ((closestItem.mins - 360) / (1440 - 360)) * 100));
      setPinPercent(percent);
    }
  };

  const handleTimelineTouch = (e) => {
    if (!timelineBarRef.current) return;
    isUserScrollingRef.current = true;

    const rect = timelineBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = (offsetX / rect.width) * 100;
    setPinPercent(percent);

    const targetMins = 360 + (percent / 100) * (1440 - 360);
    let closestItem = null;
    let minDiff = Infinity;
    currentSchedules.forEach((item) => {
      const diff = Math.abs(item.mins - targetMins);
      if (diff < minDiff) {
        minDiff = diff;
        closestItem = item;
      }
    });

    if (closestItem && scheduleItemRefs.current[closestItem.id]) {
      scheduleItemRefs.current[closestItem.id].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }

    setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 400);
  };

  const gradientBlocks = [
    '#9BB3E8', '#A8C6F2', '#B5D8ED', '#BCE5D6', '#CDE8C8',
    '#F2E5B8', '#F8D0B0', '#E5BFBE', '#CFC2DE',
  ];

  // 固定ルーティン（📌）
  const [fixedRoutines, setFixedRoutines] = useState([
    { id: 'f-1', mins: 600, startTime: '10:00', endTime: '', title: 'メール確認', dotColor: '#A3B8E8', isFixed: true, memo: '' },
    { id: 'f-5', mins: 690, startTime: '11:30', endTime: '12:00', title: '面談/MT', dotColor: null, isFixed: true, memo: 'zoomミーティング' },
    { id: 'f-6', mins: 735, startTime: '12:15', endTime: '', title: '昼休憩', dotColor: '#BEE5D3', isFixed: true, memo: '' },
    { id: 'f-12', mins: 990, startTime: '16:30', endTime: '', title: '日報・進捗記録', dotColor: '#F8D8B8', isFixed: true, memo: '' },
    { id: 'f-13', mins: 1020, startTime: '17:00', endTime: '', title: '帰宅', dotColor: null, isFixed: true, memo: '' },
    { id: 'f-14', mins: 1110, startTime: '18:30', endTime: '', title: '夕食', dotColor: '#D8C8C4', isFixed: true, memo: '' },
    { id: 'f-15', mins: 1170, startTime: '19:30', endTime: '', title: 'お風呂', dotColor: null, isFixed: true, memo: '' },
    { id: 'f-18', mins: 1410, startTime: '23:30', endTime: '', title: '就寝', dotColor: null, isFixed: true, memo: '' },
  ]);

  // 日ごとの単発予定 (カレンダー連動)
  const [daySpecificSchedules, setDaySpecificSchedules] = useState({
    '2026/10/01': [
      { id: 101, mins: 540, startTime: '09:00', endTime: '18:00', title: '大阪出張', status: 'none', dotColor: '#00BCD4', isFixed: false, memo: '新幹線移動' }
    ],
    '2026/10/03': [
      { id: 102, mins: 660, startTime: '11:00', endTime: '16:00', title: '結婚式参列', status: 'none', dotColor: '#3F51B5', isFixed: false, memo: '友人結婚式' }
    ],
    '2026/10/21': [
      { id: 2, mins: 610, startTime: '10:10', endTime: '', title: 'やること整理', status: 'none', dotColor: null, isFixed: false, memo: '' },
      { id: 3, mins: 630, startTime: '10:30', endTime: '', title: '面談/打ち合わせ準備', status: 'none', dotColor: null, isFixed: false, memo: '資料プリントアウト' },
      { id: 4, mins: 650, startTime: '10:50', endTime: '', title: '制作タスク', status: 'none', dotColor: null, isFixed: false, memo: '' },
      { id: 7, mins: 795, startTime: '13:15', endTime: '', title: '制作レビュー', status: 'none', dotColor: null, isFixed: false, memo: '' },
      { id: 8, mins: 840, startTime: '14:00', endTime: '', title: '制作作業', status: 'none', dotColor: '#FFFFFF', isFixed: false, memo: '' },
      { id: 9, mins: 885, startTime: '14:45', endTime: '', title: '小休憩', status: 'none', dotColor: null, isFixed: false, memo: '' },
      { id: 10, mins: 900, startTime: '15:00', endTime: '', title: '参考リサーチ', status: 'none', dotColor: null, isFixed: false, memo: '' },
      { id: 11, mins: 945, startTime: '15:45', endTime: '', title: 'まとめ作業', status: 'none', dotColor: null, isFixed: false, memo: '' },
      { id: 16, mins: 1215, startTime: '20:15', endTime: '', title: '個人制作', status: 'none', dotColor: '#D0C4E8', isFixed: false, memo: '' },
      { id: 17, mins: 1365, startTime: '22:45', endTime: '', title: '夜食', status: 'none', dotColor: null, isFixed: false, memo: '' },
    ]
  });

  const [dayStatusMap, setDayStatusMap] = useState({});

  // 統合スケジュール
  const currentSchedules = (() => {
    const specificList = daySpecificSchedules[selectedDateStr] || [];
    const dateStatuses = dayStatusMap[selectedDateStr] || {};
    const fixedListWithStatus = fixedRoutines.map((f) => ({
      ...f,
      status: dateStatuses[f.id] || 'none'
    }));
    return [...fixedListWithStatus, ...specificList].sort((a, b) => a.mins - b.mins);
  })();

  const formatTimeDisplay = (start, end) => {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const startStr = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    if (!end) return `${startStr} -`;
    const [eh, em] = end.split(':').map(Number);
    const eampm = eh >= 12 ? 'PM' : 'AM';
    const edisplayH = eh % 12 === 0 ? 12 : eh % 12;
    const endStr = `${String(edisplayH).padStart(2, '0')}:${String(em).padStart(2, '0')} ${eampm}`;
    return `${startStr} - ${endStr}`;
  };

  // タスク・プロジェクトデータ
  const [taskProjects, setTaskProjects] = useState([
    {
      id: 1,
      title: 'サイト制作',
      deadline: '11/3〆',
      midTasks: [
        {
          id: 101,
          title: '関連サイト概況 / まとめ',
          dueDate: '10/28まで',
          done: true,
          isOpen: true,
          subTasks: [
            { id: 1001, title: 'A社調べる', dueDate: '10/25', done: true },
            { id: 1002, title: 'B社調べる', dueDate: '10/26', done: false },
            { id: 1003, title: 'C社調べる', dueDate: '10/27', done: false },
            { id: 1004, title: 'まとめる / 考察', dueDate: '10/28', done: false }
          ]
        },
        {
          id: 102,
          title: '目標決定',
          dueDate: '10/31まで',
          done: false,
          isOpen: false,
          subTasks: [
            { id: 1005, title: 'ターゲット分析', dueDate: '10/30', done: false },
            { id: 1006, title: 'ペルソナシート作成', dueDate: '10/31', done: false }
          ]
        },
        {
          id: 103,
          title: 'コンセプト決定',
          dueDate: '11/3まで',
          done: false,
          isOpen: false,
          subTasks: [
            { id: 1007, title: 'ムードボード作成', dueDate: '11/2', done: false },
            { id: 1008, title: 'キーワード出し', dueDate: '11/3', done: false }
          ]
        }
      ]
    },
    {
      id: 2,
      title: '卒業制作',
      deadline: '11/8〆',
      midTasks: [
        {
          id: 201,
          title: '企画書提出',
          dueDate: '11/5まで',
          done: true,
          isOpen: false,
          subTasks: [
            { id: 2001, title: '構成案作成', dueDate: '', done: true },
            { id: 2002, title: '先生チェック', dueDate: '', done: true }
          ]
        },
        {
          id: 202,
          title: 'プロトタイプ作成',
          dueDate: '11/8まで',
          done: false,
          isOpen: false,
          subTasks: [
            { id: 2003, title: 'Figma画面設計', dueDate: '', done: false }
          ]
        }
      ]
    },
    {
      id: 3,
      title: '先生の課題',
      deadline: '11/12〆',
      midTasks: [
        {
          id: 301,
          title: 'リサーチ',
          dueDate: '11/10まで',
          done: false,
          isOpen: true,
          subTasks: [
            { id: 3001, title: '参考文献3冊読む', dueDate: '', done: false }
          ]
        }
      ]
    }
  ]);

  // ★ 1. 達成率の動的計算（中のチェック率に合わせて変動）
  const getProjectProgress = (project) => {
    let total = 0;
    let completed = 0;
    project.midTasks.forEach((mid) => {
      mid.subTasks.forEach((sub) => {
        total += 1;
        if (sub.done) completed += 1;
      });
    });
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // ★ 1. 100%になったら一番後ろにソートする処理
  const getSortedProjects = () => {
    return [...taskProjects].sort((a, b) => {
      const rateA = getProjectProgress(a);
      const rateB = getProjectProgress(b);
      const isDoneA = rateA === 100;
      const isDoneB = rateB === 100;
      if (isDoneA && !isDoneB) return 1; // 100%は後ろへ
      if (!isDoneA && isDoneB) return -1;
      return 0;
    });
  };

  // 大タイトル開閉状態
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const toggleCollapseProject = (projectId) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // 表示中プロジェクト
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const sortedProjectsList = getSortedProjects();
  const projectsToDisplay = selectedProjectId === 'all'
    ? sortedProjectsList
    : sortedProjectsList.filter((p) => p.id === selectedProjectId);

  // 中タイトル引き出し開閉
  const handleToggleDrawer = (projectId, midId) => {
    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          midTasks: p.midTasks.map((m) => m.id === midId ? { ...m, isOpen: !m.isOpen } : m)
        };
      }
      return p;
    }));
  };

  // 小タスク完了トグル
  const handleToggleSubTask = (projectId, midId, subId) => {
    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          midTasks: p.midTasks.map((m) => {
            if (m.id === midId) {
              return {
                ...m,
                subTasks: m.subTasks.map((s) => s.id === subId ? { ...s, done: !s.done } : s)
              };
            }
            return m;
          })
        };
      }
      return p;
    }));
  };

  // 小タスクの追加
  const [newSubTaskTitles, setNewSubTaskTitles] = useState({});
  const [newSubTaskDues, setNewSubTaskDues] = useState({});

  const handleAddInlineSubTask = (projectId, midId) => {
    const title = (newSubTaskTitles[midId] || '').trim();
    if (!title) return;
    const due = (newSubTaskDues[midId] || '').trim();

    const newSubItem = {
      id: Date.now(),
      title,
      dueDate: due,
      done: false
    };

    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          midTasks: p.midTasks.map((m) => {
            if (m.id === midId) {
              return {
                ...m,
                subTasks: [...m.subTasks, newSubItem]
              };
            }
            return m;
          })
        };
      }
      return p;
    }));

    setNewSubTaskTitles((prev) => ({ ...prev, [midId]: '' }));
    setNewSubTaskDues((prev) => ({ ...prev, [midId]: '' }));
  };

  // 小タスクの編集（丸以外のタップで編集モーダルを開く）
  const [editingSubTask, setEditingSubTask] = useState(null);

  const handleOpenEditSubTask = (projectId, midId, sub) => {
    setEditingSubTask({
      projectId,
      midId,
      id: sub.id,
      title: sub.title,
      dueDate: sub.dueDate || ''
    });
  };

  const handleSaveEditSubTask = (e) => {
    e.preventDefault();
    if (!editingSubTask || !editingSubTask.title.trim()) return;

    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === editingSubTask.projectId) {
        return {
          ...p,
          midTasks: p.midTasks.map((m) => {
            if (m.id === editingSubTask.midId) {
              return {
                ...m,
                subTasks: m.subTasks.map((s) => s.id === editingSubTask.id ? {
                  ...s,
                  title: editingSubTask.title.trim(),
                  dueDate: editingSubTask.dueDate.trim()
                } : s)
              };
            }
            return m;
          })
        };
      }
      return p;
    }));
    setEditingSubTask(null);
  };

  const handleDeleteSubTask = (projectId, midId, subId) => {
    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          midTasks: p.midTasks.map((m) => {
            if (m.id === midId) {
              return {
                ...m,
                subTasks: m.subTasks.filter((s) => s.id !== subId)
              };
            }
            return m;
          })
        };
      }
      return p;
    }));
    setEditingSubTask(null);
  };

  // 中タイトル追加モーダル
  const [isAddMidModalOpen, setIsAddMidModalOpen] = useState(false);
  const [targetProjectIdForMid, setTargetProjectIdForMid] = useState(1);
  const [newMidTitle, setNewMidTitle] = useState('');
  const [newMidDue, setNewMidDue] = useState('');

  const handleOpenAddMid = (projId) => {
    setTargetProjectIdForMid(projId);
    setIsAddMidModalOpen(true);
  };

  const handleAddMidTask = (e) => {
    e.preventDefault();
    if (!newMidTitle.trim()) return;

    const newMid = {
      id: Date.now(),
      title: newMidTitle.trim(),
      dueDate: newMidDue.trim() ? `${newMidDue.trim()}まで` : '',
      done: false,
      isOpen: true,
      subTasks: []
    };

    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === targetProjectIdForMid) {
        return { ...p, midTasks: [...p.midTasks, newMid] };
      }
      return p;
    }));

    setNewMidTitle('');
    setNewMidDue('');
    setIsAddMidModalOpen(false);
  };

  // 大タイトル新規追加モーダル
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newBigProjectTitle, setNewBigProjectTitle] = useState('');
  const [newBigProjectDeadline, setNewBigProjectDeadline] = useState('');

  const handleCreateNewProject = (e) => {
    e.preventDefault();
    if (!newBigProjectTitle.trim()) return;

    const newProject = {
      id: Date.now(),
      title: newBigProjectTitle.trim(),
      deadline: newBigProjectDeadline.trim() ? `${newBigProjectDeadline.trim()}〆` : '未定',
      midTasks: []
    };

    setTaskProjects((prev) => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    setNewBigProjectTitle('');
    setNewBigProjectDeadline('');
    setIsAddProjectModalOpen(false);
  };

  // 大タイトル・中タイトルの編集モーダル
  const [editingProject, setEditingProject] = useState(null);
  const [editingMidTask, setEditingMidTask] = useState(null);

  const handleSaveEditProject = (e) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title.trim()) return;
    setTaskProjects((prev) => prev.map((p) => p.id === editingProject.id ? editingProject : p));
    setEditingProject(null);
  };

  const handleDeleteProject = (projId) => {
    setTaskProjects((prev) => prev.filter((p) => p.id !== projId));
    setSelectedProjectId('all');
    setEditingProject(null);
  };

  const handleSaveEditMidTask = (e) => {
    e.preventDefault();
    if (!editingMidTask || !editingMidTask.title.trim()) return;
    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === editingMidTask.projectId) {
        return {
          ...p,
          midTasks: p.midTasks.map((m) => m.id === editingMidTask.id ? {
            ...m,
            title: editingMidTask.title.trim(),
            dueDate: editingMidTask.dueDate.trim()
          } : m)
        };
      }
      return p;
    }));
    setEditingMidTask(null);
  };

  const handleDeleteMidTask = (projectId, midId) => {
    setTaskProjects((prev) => prev.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          midTasks: p.midTasks.filter((m) => m.id !== midId)
        };
      }
      return p;
    }));
    setEditingMidTask(null);
  };

  // やることリスト詳細モーダル（スケジュール画面から）
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  // 予定の編集モーダル（📌固定、時間ピッカー、メモ、削除）
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleSaveEditSchedule = (e) => {
    e.preventDefault();
    if (!editingSchedule || !editingSchedule.title.trim()) return;
    const [h, m] = (editingSchedule.startTime || '10:00').split(':').map(Number);
    const mins = h * 60 + m;
    const updated = { ...editingSchedule, mins };

    if (updated.isFixed) {
      setFixedRoutines((prev) => {
        const exists = prev.some((item) => item.id === updated.id);
        if (exists) return prev.map((item) => item.id === updated.id ? updated : item).sort((a, b) => a.mins - b.mins);
        return [...prev, updated].sort((a, b) => a.mins - b.mins);
      });
      setDaySpecificSchedules((prev) => ({
        ...prev,
        [selectedDateStr]: (prev[selectedDateStr] || []).filter((item) => item.id !== updated.id)
      }));
    } else {
      setFixedRoutines((prev) => prev.filter((item) => item.id !== updated.id));
      setDaySpecificSchedules((prev) => {
        const list = prev[selectedDateStr] || [];
        const exists = list.some((item) => item.id === updated.id);
        const nextList = exists ? list.map((item) => item.id === updated.id ? updated : item) : [...list, updated];
        return { ...prev, [selectedDateStr]: nextList.sort((a, b) => a.mins - b.mins) };
      });
    }
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (id) => {
    setFixedRoutines((prev) => prev.filter((item) => item.id !== id));
    setDaySpecificSchedules((prev) => ({
      ...prev,
      [selectedDateStr]: (prev[selectedDateStr] || []).filter((item) => item.id !== id)
    }));
    setEditingSchedule(null);
  };

  // 予定の追加モーダル
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newScheduleData, setNewScheduleData] = useState({
    title: '',
    startTime: '14:00',
    endTime: '',
    isFixed: false,
    memo: ''
  });

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!newScheduleData.title.trim()) return;
    const [h, m] = (newScheduleData.startTime || '14:00').split(':').map(Number);
    const mins = (h || 0) * 60 + (m || 0);

    const newSchedule = {
      id: Date.now(),
      mins,
      startTime: newScheduleData.startTime,
      endTime: newScheduleData.endTime,
      title: newScheduleData.title.trim(),
      status: 'none',
      dotColor: null,
      isFixed: newScheduleData.isFixed,
      memo: newScheduleData.memo.trim()
    };

    if (newSchedule.isFixed) {
      setFixedRoutines((prev) => [...prev, newSchedule].sort((a, b) => a.mins - b.mins));
    } else {
      setDaySpecificSchedules((prev) => {
        const list = prev[selectedDateStr] || [];
        return { ...prev, [selectedDateStr]: [...list, newSchedule].sort((a, b) => a.mins - b.mins) };
      });
    }

    setNewScheduleData({ title: '', startTime: '14:00', endTime: '', isFixed: false, memo: '' });
    setIsAddScheduleOpen(false);
  };

  // フリックステータス
  const [activeFlickId, setActiveFlickId] = useState(null);

  const [reviews, setReviews] = useState([
    { id: 1, name: '早起き', status: 'done' },
    { id: 2, name: '禁酒', status: 'partial' },
    { id: 3, name: '間食', status: 'skipped' },
    { id: 4, name: '禁煙', status: 'failed' },
  ]);

  const updateStatus = (type, id, newStatus) => {
    if (type === 'schedule') {
      setDayStatusMap((prev) => ({
        ...prev,
        [selectedDateStr]: { ...(prev[selectedDateStr] || {}), [id]: newStatus }
      }));
    } else if (type === 'review') {
      setReviews((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
    }
    setActiveFlickId(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return '✓';
      case 'partial': return '△';
      case 'failed': return '✕';
      case 'skipped': return '—';
      default: return '';
    }
  };

  // 集計
  const totalSchedules = currentSchedules.length || 1;
  const doneCount = currentSchedules.filter((s) => s.status === 'done').length;
  const failedCount = currentSchedules.filter((s) => s.status === 'failed' || s.status === 'partial').length;
  const noneCount = totalSchedules - doneCount - failedCount;

  const todayDonePercent = (doneCount / totalSchedules) * 100;
  const todayFailedPercent = (failedCount / totalSchedules) * 100;
  const todayNonePercent = (noneCount / totalSchedules) * 100;

  // ★ 4. カレンダーデータ生成（画像5に完全連動：2026年10月）
  // 曜日：月 火 水 木 金 土 日
  const getCalendarDays = () => {
    // 2026年10月のカレンダー
    // 10月1日は木曜日。月〜水は前月(9月)の28, 29, 30日。
    // 10月31日は土曜日。日は翌月(11月)の1日。
    const days = [];
    // 前月オーバーフロー
    days.push({ dayNum: 28, isCurrentMonth: false, dateKey: '2026/09/28' });
    days.push({ dayNum: 29, isCurrentMonth: false, dateKey: '2026/09/29' });
    days.push({ dayNum: 30, isCurrentMonth: false, dateKey: '2026/09/30' });
    // 当月 1〜31
    for (let d = 1; d <= 31; d++) {
      const formatted = `2026/10/${String(d).padStart(2, '0')}`;
      days.push({ dayNum: d, isCurrentMonth: true, dateKey: formatted });
    }
    // 翌月オーバーフロー
    days.push({ dayNum: 1, isCurrentMonth: false, dateKey: '2026/11/01' });
    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="app-container">
      {/* ★ 3. 固定ヘッダー（画像3デザイン完全準拠：日付と ◀ ▶ ナビゲーター復活） */}
      <header className="app-header">
        {currentTab === 'schedule' ? (
          <button 
            className="icon-btn header-cal-toggle" 
            title={viewMode === 'timeline' ? 'カレンダーを表示' : 'タイムラインを表示'}
            onClick={() => setViewMode(viewMode === 'timeline' ? 'calendar' : 'timeline')}
          >
            {viewMode === 'timeline' ? (
              <span className="cal-icon-svg">📅</span>
            ) : (
              <span className="cal-icon-svg">📋</span>
            )}
          </button>
        ) : (
          <div style={{ width: 34 }} />
        )}

        <div className="header-title-box">
          <h1 className="header-title">
            {currentTab === 'schedule' ? (viewMode === 'timeline' ? 'スケジュール' : 'カレンダー') : currentTab === 'task' ? 'タスク' : '日報'}
          </h1>
          <div className="header-date-nav">
            {currentTab === 'schedule' && viewMode === 'calendar' ? (
              <>
                <button className="date-arrow-btn" onClick={() => handleShiftMonth(-1)}>◀</button>
                <span className="header-date">2026/10/01 ~ 2026/10/31</span>
                <button className="date-arrow-btn" onClick={() => handleShiftMonth(1)}>▶</button>
              </>
            ) : (
              <>
                <button className="date-arrow-btn" onClick={() => handleShiftDate(-1)}>◀</button>
                <span className="header-date">{selectedDateStr}</span>
                <button className="date-arrow-btn" onClick={() => handleShiftDate(1)}>▶</button>
              </>
            )}
          </div>
        </div>

        <button className="icon-btn">⚙️</button>
      </header>

      {/* メインエリア */}
      <main className="main-content">
        {/* ================= タスク画面 ================= */}
        {currentTab === 'task' && (
          <div className="task-view-container">
            <div className="week-strip">
              <div className="day-badge active"><div style={{ fontSize: 9 }}>水曜日</div><div className="day-num">21</div></div>
              <div className="day-badge"><div style={{ fontSize: 9 }}>木曜日</div><div className="day-num">22</div></div>
              <div className="day-badge"><div style={{ fontSize: 9 }}>金曜日</div><div className="day-num">23</div></div>
              <div className="day-badge"><div style={{ fontSize: 9 }}>土曜日</div><div className="day-num">24</div></div>
              <div className="day-badge"><div style={{ fontSize: 9 }}>太陽</div><div className="day-num">25</div></div>
            </div>

            <div className="deadline-tags-slider">
              <button 
                className={`deadline-tag all-view ${selectedProjectId === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedProjectId('all')}
              >
                👀 全部一気見
              </button>
              {sortedProjectsList.map((proj) => (
                <button 
                  key={proj.id} 
                  className={`deadline-tag ${selectedProjectId === proj.id ? 'active' : ''}`}
                  onClick={() => setSelectedProjectId(proj.id)}
                >
                  {proj.deadline} {proj.title}
                </button>
              ))}
            </div>

            <div className="project-cards-stack">
              {projectsToDisplay.map((project) => {
                const progress = getProjectProgress(project);
                const isCompleted = progress === 100;

                return (
                  <div key={project.id} className={`project-big-card ${isCompleted ? 'project-card-completed' : ''}`}>
                    <div className="project-header-row">
                      <div className="project-title-left">
                        <span className="project-big-title">{project.title}</span>
                        <button 
                          className="edit-pencil-btn" 
                          title="大タイトルを編集"
                          onClick={() => setEditingProject({ ...project })}
                        >
                          ✏️
                        </button>
                        <span 
                          className="accordion-arrow"
                          style={{ 
                            transform: collapsedProjects[project.id] ? 'rotate(-90deg)' : 'none',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            display: 'inline-block',
                            fontSize: '12px'
                          }}
                          title={collapsedProjects[project.id] ? "開く" : "閉じる"}
                          onClick={() => toggleCollapseProject(project.id)}
                        >
                          ▼
                        </span>
                      </div>
                      {/* ★ 1. 中のチェックに合わせてリアルタイム連動する達成率表示 */}
                      <span className="project-big-meta">
                        達成率{progress}% ( {project.deadline} )
                      </span>
                    </div>

                    {!collapsedProjects[project.id] && (
                      <>
                        <div>
                          {project.midTasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '16px 0', color: '#9E918C', fontSize: 12 }}>
                              中タイトル（作業フェーズ）がまだありません。<br />下のボタンから追加してください。
                            </div>
                          ) : (
                            project.midTasks.map((mid) => (
                              <div key={mid.id} className="mid-task-accordion">
                                <div className="mid-task-header">
                                  <div className="mid-task-title-area" onClick={() => handleToggleDrawer(project.id, mid.id)}>
                                    <span className="mid-task-title">{mid.title}</span>
                                    {mid.dueDate && <span className="due-badge">{mid.dueDate}</span>}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button 
                                      className="edit-pencil-btn" 
                                      title="中タイトルを編集"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingMidTask({ ...mid, projectId: project.id });
                                      }}
                                    >
                                      ✏️
                                    </button>
                                    <span 
                                      className="accordion-arrow" 
                                      style={{ transform: mid.isOpen ? 'rotate(180deg)' : 'none' }}
                                      onClick={() => handleToggleDrawer(project.id, mid.id)}
                                    >
                                      ▼
                                    </span>
                                  </div>
                                </div>

                                {mid.isOpen && (
                                  <div className="drawer-content">
                                    {mid.subTasks.length === 0 ? (
                                      <div style={{ fontSize: 11, color: '#9E918C', padding: '6px 0' }}>小ToDoがまだありません</div>
                                    ) : (
                                      mid.subTasks.map((sub) => (
                                        <div key={sub.id} className={`subtask-mini-row ${sub.done ? 'done' : ''}`}>
                                          {/* ★ 2. 棒線は無し！丸以外の部分タップで編集モーダルが開く */}
                                          <div 
                                            className="subtask-mini-left" 
                                            onClick={() => handleOpenEditSubTask(project.id, mid.id, sub)}
                                            title="タップして編集"
                                          >
                                            <span className="subtask-text-clickable">{sub.title}</span>
                                            {sub.dueDate && <span className="subtask-mini-due">({sub.dueDate}まで)</span>}
                                          </div>
                                          {/* 丸（チェックサークル）タップで完了切り替え */}
                                          <button 
                                            className={`subtask-mini-circle ${sub.done ? 'checked' : ''}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleSubTask(project.id, mid.id, sub.id);
                                            }}
                                          >
                                            {sub.done ? '✓' : ''}
                                          </button>
                                        </div>
                                      ))
                                    )}

                                    {/* インライン小タスク追加 */}
                                    <div className="inline-add-subtask-row">
                                      <input 
                                        type="text" 
                                        className="inline-subtask-input" 
                                        placeholder="＋ 細かいToDoを追加"
                                        value={newSubTaskTitles[mid.id] || ''}
                                        onChange={(e) => setNewSubTaskTitles({ ...newSubTaskTitles, [mid.id]: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddInlineSubTask(project.id, mid.id);
                                          }
                                        }}
                                      />
                                      <input 
                                        type="text" 
                                        className="inline-due-input" 
                                        placeholder="期日"
                                        value={newSubTaskDues[mid.id] || ''}
                                        onChange={(e) => setNewSubTaskDues({ ...newSubTaskDues, [mid.id]: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddInlineSubTask(project.id, mid.id);
                                          }
                                        }}
                                      />
                                      <button 
                                        type="button"
                                        className="inline-subtask-btn" 
                                        onClick={() => handleAddInlineSubTask(project.id, mid.id)}
                                      >
                                        追加
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <button className="add-mid-dark-btn" onClick={() => handleOpenAddMid(project.id)}>
                          ＋タイトル中（作業フェーズ）を追加
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="add-big-project-bottom-btn" onClick={() => setIsAddProjectModalOpen(true)}>
              ＋ 新しい大タイトル（プロジェクト）を追加
            </button>
          </div>
        )}

        {/* ================= スケジュール画面（タイムライン表示） ================= */}
        {currentTab === 'schedule' && viewMode === 'timeline' && (
          <>
            <div 
              className="timeline-bar-wrapper"
              ref={timelineBarRef}
              onClick={handleTimelineTouch}
              onTouchMove={handleTimelineTouch}
            >
              <div className="timeline-bar">
                <div className="current-time-indicator" style={{ left: `${pinPercent}%` }}>
                  <div className="current-time-pin"></div>
                </div>
                {gradientBlocks.map((color, i) => (
                  <div key={i} className="timeline-block" style={{ backgroundColor: color }}></div>
                ))}
              </div>
              <div className="timeline-hours">
                <span>6</span><span>8</span><span>10</span><span>12</span><span>14</span><span>16</span><span>18</span><span>20</span><span>22</span><span>24</span>
              </div>
            </div>

            <div 
              className="schedule-scroll-container" 
              ref={scheduleContainerRef}
              onScroll={handleScheduleScroll}
            >
              <div className="card-list">
                {currentSchedules.map((item) => (
                  <div 
                    key={item.id} 
                    className="schedule-card-wrapper"
                    ref={(el) => scheduleItemRefs.current[item.id] = el}
                  >
                    {item.dotColor && (
                      <div className="timeline-dot" style={{ backgroundColor: item.dotColor }}></div>
                    )}
                    <div className={`schedule-card ${item.status}`} onClick={() => setEditingSchedule({ ...item })}>
                      <div className="schedule-info">
                        <div className="schedule-time">{formatTimeDisplay(item.startTime, item.endTime)}</div>
                        <div className="schedule-title-row">
                          <span className="schedule-title">{item.title}</span>
                          {item.isFixed && <span className="pin-badge">📌</span>}
                          {/* メモ電光掲示板アニメーション */}
                          {item.memo && (
                            <div className="memo-ticker-container">
                              <span className="memo-ticker-text">💬 {item.memo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="status-button-wrapper" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={`status-trigger-btn ${item.status}`}
                          onClick={() => setActiveFlickId(activeFlickId === item.id ? null : item.id)}
                        >
                          {getStatusIcon(item.status)}
                        </button>

                        {/* 4方向フリックメニュー */}
                        {activeFlickId === item.id && (
                          <div className="embedded-flick-menu">
                            <div className="cross-item up" onClick={() => updateStatus('schedule', item.id, 'done')}>✓</div>
                            <div className="cross-item right" onClick={() => updateStatus('schedule', item.id, 'partial')}>△</div>
                            <div className="cross-item down" onClick={() => updateStatus('schedule', item.id, 'failed')}>✕</div>
                            <div className="cross-item left" onClick={() => updateStatus('schedule', item.id, 'skipped')}>—</div>
                            <div className="cross-item center" onClick={() => updateStatus('schedule', item.id, 'none')}>○</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="add-unified-btn" onClick={() => setIsAddScheduleOpen(true)}>
              追加する <span className="add-circle-icon">＋</span>
            </button>

            {/* やることリスト（横スライダー） */}
            <div className="project-summary-box">
              <div className="project-box-header">
                <span className="section-label">やることリスト</span>
                <button className="mini-add-btn" onClick={() => setCurrentTab('task')}>＋ 追加</button>
              </div>
              <div className="project-slider">
                {/* ★ 1. 100%は自動的に一番後ろに移動＆少し暗くなる */}
                {sortedProjectsList.map((p) => {
                  const progress = getProjectProgress(p);
                  const isCompleted = progress === 100;
                  return (
                    <div 
                      key={p.id} 
                      className={`project-slide-card ${isCompleted ? 'slide-card-completed' : ''}`}
                      onClick={() => setSelectedProjectModal(p)}
                    >
                      <div className="project-slide-title">{p.title}</div>
                      <div className="progress-text">達成率 {progress}% ({p.deadline})</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ================= ★ 4. カレンダー画面（画像5完全再現：棒線と予定名連動） ================= */}
        {currentTab === 'schedule' && viewMode === 'calendar' && (
          <div className="calendar-full-view">
            {/* カレンダー曜日ヘッダー */}
            <div className="calendar-weekday-bar">
              <span className="cal-weekday">月</span>
              <span className="cal-weekday">火</span>
              <span className="cal-weekday">水</span>
              <span className="cal-weekday">木</span>
              <span className="cal-weekday">金</span>
              <span className="cal-weekday saturday">土</span>
              <span className="cal-weekday sunday">日</span>
            </div>

            {/* カレンダーグリッド（画像5デザイン） */}
            <div className="calendar-grid-table">
              {calendarDays.map((cell, idx) => {
                const isSelected = selectedDateStr === cell.dateKey;
                const colIdx = idx % 7; // 0:月, ..., 5:土, 6:日
                const isSaturday = colIdx === 5;
                const isSunday = colIdx === 6;

                // その日に入っているスケジュール
                const daySchedules = daySpecificSchedules[cell.dateKey] || [];

                return (
                  <div 
                    key={idx}
                    className={`calendar-cell ${!cell.isCurrentMonth ? 'overflow-cell' : ''} ${isSelected ? 'selected-day-cell' : ''}`}
                    onClick={() => {
                      setSelectedDateStr(cell.dateKey);
                      setViewMode('timeline'); // 日付を選んだらその日のスケジュールにジャンプ
                    }}
                  >
                    <div className="calendar-date-header">
                      <span className={`calendar-day-number ${isSaturday ? 'sat-color' : ''} ${isSunday ? 'sun-color' : ''}`}>
                        {cell.dayNum}
                      </span>
                    </div>

                    {/* ★ 4. 画像5準拠：予定が入ったら棒線と予定名が表示される */}
                    <div className="calendar-events-container">
                      {/* 大阪出張（10/1）のシアン青ライン＆タイトル */}
                      {cell.dateKey === '2026/10/01' && (
                        <div className="calendar-event-bar-wrapper">
                          <span className="calendar-event-title osaka-color">大阪</span>
                          <div className="calendar-event-cyan-line"></div>
                        </div>
                      )}

                      {/* 結婚式参列（10/3）の紺タイトル */}
                      {cell.dateKey === '2026/10/03' && (
                        <div className="calendar-event-bar-wrapper">
                          <span className="calendar-event-title wedding-color">結婚式</span>
                        </div>
                      )}

                      {/* 動的に登録された予定の棒線と予定名 */}
                      {daySchedules.map((sch) => (
                        <div key={sch.id} className="calendar-event-bar-wrapper">
                          {sch.title !== '大阪出張' && sch.title !== '結婚式参列' && (
                            <>
                              <span className="calendar-event-title general-event">{sch.title}</span>
                              <div className="calendar-event-cyan-line"></div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 日報画面 ================= */}
        {currentTab === 'report' && (
          <div>
            <div className="report-card-box">
              <div className="chart-legend-row">
                <span><span className="legend-square" style={{ background: '#E2F0D9' }}></span>= 達成</span>
                <span><span className="legend-square" style={{ background: '#F8D7DA' }}></span>= 未達成</span>
                <span><span className="legend-square" style={{ background: '#ECEAE6' }}></span>= 未設定</span>
              </div>

              <div className="tab-toggle-row">
                <button className="tab-toggle-btn active">週</button>
                <button className="tab-toggle-btn">月</button>
              </div>

              <div className="chart-bars-container">
                <div className="bar-col">
                  <div className="bar-seg done" style={{ height: '70%' }}></div>
                  <div className="bar-seg failed" style={{ height: '15%' }}></div>
                  <div className="bar-seg none" style={{ height: '15%' }}></div>
                </div>
                <div className="bar-col">
                  <div className="bar-seg done" style={{ height: '50%' }}></div>
                  <div className="bar-seg failed" style={{ height: '10%' }}></div>
                  <div className="bar-seg none" style={{ height: '40%' }}></div>
                </div>
                <div className="bar-col" style={{ boxShadow: '0 0 0 1.5px #5EAA81' }}>
                  <div className="bar-seg done" style={{ height: `${todayDonePercent}%` }}></div>
                  <div className="bar-seg failed" style={{ height: `${todayFailedPercent}%` }}></div>
                  <div className="bar-seg none" style={{ height: `${todayNonePercent}%` }}></div>
                </div>
                <div className="bar-col"><div className="bar-seg none" style={{ height: '100%' }}></div></div>
                <div className="bar-col"><div className="bar-seg none" style={{ height: '100%' }}></div></div>
                <div className="bar-col"><div className="bar-seg none" style={{ height: '100%' }}></div></div>
                <div className="bar-col"><div className="bar-seg none" style={{ height: '100%' }}></div></div>
              </div>

              <div className="chart-date-nav">
                <span>&lt;</span>
                <span>2026/10/19 〜 2026/10/25</span>
                <span>&gt;</span>
              </div>
            </div>

            <div style={{ background: '#FFF', borderRadius: 14, padding: 14, border: '1px solid #F0ECE4' }}>
              <div className="section-label">振り返り</div>
              <div className="review-grid">
                {reviews.map((item) => (
                  <div key={item.id} className="review-card">
                    <div className="review-name">{item.name}</div>
                    <button className={`status-trigger-btn ${item.status}`} style={{ margin: '0 auto' }} onClick={() => updateStatus('review', item.id, item.status === 'done' ? 'failed' : 'done')}>
                      {getStatusIcon(item.status)}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button className="add-unified-btn" style={{ marginTop: 10 }}>
              追加する <span className="add-circle-icon">＋</span>
            </button>
          </div>
        )}
      </main>

      {/* 固定フッターナビゲーション */}
      <nav className="bottom-nav">
        <button className={`nav-tab ${currentTab === 'task' ? 'active' : ''}`} onClick={() => setCurrentTab('task')}>タスク</button>
        <button className={`nav-tab ${currentTab === 'schedule' ? 'active' : ''}`} onClick={() => setCurrentTab('schedule')}>スケジュール</button>
        <button className={`nav-tab ${currentTab === 'report' ? 'active' : ''}`} onClick={() => setCurrentTab('report')}>日報</button>
      </nav>

      {activeFlickId && (
        <div className="flick-overlay-backdrop" onClick={() => setActiveFlickId(null)} />
      )}

      {/* ================= やることリスト詳細モーダル ================= */}
      {selectedProjectModal && (
        <div className="modal-backdrop" onClick={() => setSelectedProjectModal(null)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">{selectedProjectModal.title} の詳細</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FAF6F0', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
              <span>達成率: <strong>{getProjectProgress(selectedProjectModal)}%</strong></span>
              <span>締切: <strong>{selectedProjectModal.deadline}</strong></span>
            </div>

            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
              {selectedProjectModal.midTasks && selectedProjectModal.midTasks.map((mid) => (
                <div key={mid.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#433633', marginBottom: 4 }}>
                    📁 {mid.title} {mid.dueDate && <span style={{ fontSize: 10, color: '#A36B4F' }}>({mid.dueDate})</span>}
                  </div>
                  {mid.subTasks && mid.subTasks.map((sub) => (
                    <div 
                      key={sub.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6, 
                        padding: '4px 0 4px 12px',
                        fontSize: 12,
                        color: sub.done ? '#9E918C' : '#5A4740',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleToggleSubTask(selectedProjectModal.id, mid.id, sub.id)}
                    >
                      {/* ★ 2. 棒線なしのチェックボックス */}
                      <span>{sub.done ? '✅' : '⬜'}</span>
                      <span>{sub.title}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="edit-modal-actions">
              <button type="button" className="btn-save" style={{ width: '100%' }} onClick={() => setSelectedProjectModal(null)}>閉じる</button>
            </div>

            <span 
              className="modal-bottom-edit-link"
              onClick={() => {
                setSelectedProjectId(selectedProjectModal.id);
                setSelectedProjectModal(null);
                setCurrentTab('task');
              }}
            >
              <u>このプロジェクトを編集 / 追加する</u>
            </span>
          </div>
        </div>
      )}

      {/* ================= 大タイトル（プロジェクト）編集モーダル ================= */}
      {editingProject && (
        <div className="modal-backdrop" onClick={() => setEditingProject(null)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">大タイトルの編集</div>
            <form onSubmit={handleSaveEditProject}>
              <div className="form-group">
                <label>プロジェクト名（大タイトル）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingProject.title} 
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>締切目安</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingProject.deadline} 
                  onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })} 
                />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="btn-delete" onClick={() => handleDeleteProject(editingProject.id)}>削除</button>
                <button type="button" className="btn-cancel" onClick={() => setEditingProject(null)}>閉じる</button>
                <button type="submit" className="btn-save">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 中タイトル（作業フェーズ）編集モーダル ================= */}
      {editingMidTask && (
        <div className="modal-backdrop" onClick={() => setEditingMidTask(null)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">中タイトルの編集</div>
            <form onSubmit={handleSaveEditMidTask}>
              <div className="form-group">
                <label>中タイトル名（作業フェーズ）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingMidTask.title} 
                  onChange={(e) => setEditingMidTask({ ...editingMidTask, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>いつまで（期日・期限）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例: 10/28まで"
                  value={editingMidTask.dueDate} 
                  onChange={(e) => setEditingMidTask({ ...editingMidTask, dueDate: e.target.value })} 
                />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="btn-delete" onClick={() => handleDeleteMidTask(editingMidTask.projectId, editingMidTask.id)}>削除</button>
                <button type="button" className="btn-cancel" onClick={() => setEditingMidTask(null)}>閉じる</button>
                <button type="submit" className="btn-save">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 小タスク（ToDo）編集モーダル ================= */}
      {editingSubTask && (
        <div className="modal-backdrop" onClick={() => setEditingSubTask(null)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">ToDoの編集</div>
            <form onSubmit={handleSaveEditSubTask}>
              <div className="form-group">
                <label>ToDo内容</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingSubTask.title} 
                  onChange={(e) => setEditingSubTask({ ...editingSubTask, title: e.target.value })} 
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>いつまで（期日）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例: 10/28"
                  value={editingSubTask.dueDate} 
                  onChange={(e) => setEditingSubTask({ ...editingSubTask, dueDate: e.target.value })} 
                />
              </div>
              <div className="edit-modal-actions">
                <button 
                  type="button" 
                  className="btn-delete" 
                  onClick={() => handleDeleteSubTask(editingSubTask.projectId, editingSubTask.midId, editingSubTask.id)}
                >
                  削除
                </button>
                <button type="button" className="btn-cancel" onClick={() => setEditingSubTask(null)}>閉じる</button>
                <button type="submit" className="btn-save">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 大タイトル新規追加モーダル ================= */}
      {isAddProjectModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddProjectModalOpen(false)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">大タイトルを追加</div>
            <form onSubmit={handleCreateNewProject}>
              <div className="form-group">
                <label>プロジェクト名（大タイトル）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例: ポートフォリオ制作" 
                  value={newBigProjectTitle} 
                  onChange={(e) => setNewBigProjectTitle(e.target.value)} 
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>締切目安（空欄でもOK）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例: 12/15" 
                  value={newBigProjectDeadline} 
                  onChange={(e) => setNewBigProjectDeadline(e.target.value)} 
                />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddProjectModalOpen(false)}>キャンセル</button>
                <button type="submit" className="btn-save">作成する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 中タイトル新規追加モーダル ================= */}
      {isAddMidModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddMidModalOpen(false)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">中タイトルを追加</div>
            <form onSubmit={handleAddMidTask}>
              <div className="form-group">
                <label>中タイトル名（作業フェーズ）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例: デザインカンプ作成" 
                  value={newMidTitle} 
                  onChange={(e) => setNewMidTitle(e.target.value)} 
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>いつまで（期日・期限）</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例: 11/15、来週水曜 など" 
                  value={newMidDue} 
                  onChange={(e) => setNewMidDue(e.target.value)} 
                />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddMidModalOpen(false)}>キャンセル</button>
                <button type="submit" className="btn-save">追加する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 予定の編集モーダル ================= */}
      {editingSchedule && (
        <div className="modal-backdrop" onClick={() => setEditingSchedule(null)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">予定の編集</div>
            <form onSubmit={handleSaveEditSchedule}>
              <div className="fix-toggle-row">
                <span>📌 固定にする（毎日ルーティン）</span>
                <div 
                  className={`toggle-switch ${editingSchedule.isFixed ? 'active' : ''}`}
                  onClick={() => setEditingSchedule((prev) => ({ ...prev, isFixed: !prev.isFixed }))}
                />
              </div>

              <div className="form-group">
                <label>予定タイトル</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingSchedule.title} 
                  onChange={(e) => setEditingSchedule((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>時間設定（開始 〜 終了）</label>
                <div className="time-picker-row">
                  <div className="time-input-box">
                    <input 
                      type="time" 
                      className="time-picker-input" 
                      value={editingSchedule.startTime || ''} 
                      onChange={(e) => setEditingSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <span className="time-separator">〜</span>
                  <div className="time-input-box">
                    <input 
                      type="time" 
                      className="time-picker-input" 
                      value={editingSchedule.endTime || ''} 
                      onChange={(e) => setEditingSchedule((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>メモ</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="メモや補足を自由に記入"
                  value={editingSchedule.memo || ''} 
                  onChange={(e) => setEditingSchedule((prev) => ({ ...prev, memo: e.target.value }))}
                />
              </div>

              <div className="edit-modal-actions">
                <button type="button" className="btn-delete" onClick={() => handleDeleteSchedule(editingSchedule.id)}>削除</button>
                <button type="button" className="btn-cancel" onClick={() => setEditingSchedule(null)}>閉じる</button>
                <button type="submit" className="btn-save">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 予定の追加モーダル ================= */}
      {isAddScheduleOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddScheduleOpen(false)}>
          <div className="edit-schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-title">予定の追加</div>
            <form onSubmit={handleAddSchedule}>
              <div className="fix-toggle-row">
                <span>📌 固定にする（毎日ルーティン）</span>
                <div 
                  className={`toggle-switch ${newScheduleData.isFixed ? 'active' : ''}`}
                  onClick={() => setNewScheduleData((prev) => ({ ...prev, isFixed: !prev.isFixed }))}
                />
              </div>

              <div className="form-group">
                <label>予定タイトル</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例: デザイン制作" 
                  value={newScheduleData.title} 
                  onChange={(e) => setNewScheduleData((prev) => ({ ...prev, title: e.target.value }))} 
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>時間設定（開始 〜 終了）</label>
                <div className="time-picker-row">
                  <div className="time-input-box">
                    <input 
                      type="time" 
                      className="time-picker-input" 
                      value={newScheduleData.startTime} 
                      onChange={(e) => setNewScheduleData((prev) => ({ ...prev, startTime: e.target.value }))} 
                    />
                  </div>
                  <span className="time-separator">〜</span>
                  <div className="time-input-box">
                    <input 
                      type="time" 
                      className="time-picker-input" 
                      value={newScheduleData.endTime} 
                      onChange={(e) => setNewScheduleData((prev) => ({ ...prev, endTime: e.target.value }))} 
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>メモ</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="メモや補足を自由に記入"
                  value={newScheduleData.memo} 
                  onChange={(e) => setNewScheduleData((prev) => ({ ...prev, memo: e.target.value }))}
                />
              </div>

              <div className="edit-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddScheduleOpen(false)}>キャンセル</button>
                <button type="submit" className="btn-save">追加する</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
