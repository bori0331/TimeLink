// ── script.js に追記・修正が必要な2箇所 ──

// 1. deleteEvent を以下で置き換え（Firestore保存を追加）
async function deleteEvent(key, index) {
    if (!confirm("削除しますか？")) return;

    events[key].splice(index, 1);
    if (events[key].length === 0) delete events[key];

    localStorage.setItem("events", JSON.stringify(events));

    // ← ここがなかった：Firestoreにも保存
    const user = auth.currentUser;
    if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const coupleId = userSnap.data().coupleId;
        await setDoc(
            doc(db, "couples", coupleId),
            { events: events },
            { merge: true }
        );
        console.log("Firestore削除保存成功");
    }

    createCalendar();
    closeModal();
}
window.deleteEvent = deleteEvent;

// 2. showAddForm を追加（モーダルで「＋追加」を押したとき）
function showAddForm(key) {
    closeModal();
    // 日付欄に選択した日を自動セット
    const el = document.getElementById("eventDate");
    if (el) el.value = key;
    // フォームまでスムーズスクロール
    document.querySelector(".add-event")
        ?.scrollIntoView({ behavior: "smooth" });
}
window.showAddForm = showAddForm;