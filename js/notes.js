// Notes Manager - Handles note-taking and journaling functionality
class NotesManager {
    constructor() {
        this.currentFilter = 'all';
        this.editingNoteId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNotes();
    }

    setupEventListeners() {
        // Add note button
        const addNoteBtn = document.getElementById('addNoteBtn');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => this.showNoteModal());
        }

        // Modal controls
        const closeModal = document.getElementById('closeModal');
        const cancelNote = document.getElementById('cancelNote');
        const saveNote = document.getElementById('saveNote');
        const noteModal = document.getElementById('noteModal');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideNoteModal());
        }

        if (cancelNote) {
            cancelNote.addEventListener('click', () => this.hideNoteModal());
        }

        if (saveNote) {
            saveNote.addEventListener('click', () => this.saveNote());
        }

        // Modal backdrop click
        if (noteModal) {
            noteModal.addEventListener('click', (e) => {
                if (e.target === noteModal) {
                    this.hideNoteModal();
                }
            });
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Enter key in title field moves to content
        const noteTitle = document.getElementById('noteTitle');
        if (noteTitle) {
            noteTitle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const noteContent = document.getElementById('noteContent');
                    if (noteContent) {
                        noteContent.focus();
                    }
                }
            });
        }

        // Auto-save functionality
        const noteContent = document.getElementById('noteContent');
        if (noteContent) {
            let autoSaveTimer;
            noteContent.addEventListener('input', () => {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(() => {
                    this.autoSave();
                }, 2000);
            });
        }
    }

    loadNotes() {
        const notes = StorageManager.getNotes();
        this.displayNotes(notes);
    }

    displayNotes(notes) {
        const notesContainer = document.getElementById('notesContainer');
        if (!notesContainer) return;

        // Filter notes based on current filter
        const filteredNotes = this.filterNotes(notes);

        if (filteredNotes.length === 0) {
            notesContainer.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const notesHTML = filteredNotes.map(note => this.createNoteHTML(note)).join('');
        notesContainer.innerHTML = notesHTML;

        // Add event listeners to note actions
        this.attachNoteEventListeners();
    }

    filterNotes(notes) {
        const today = new Date().toDateString();
        
        switch (this.currentFilter) {
            case 'today':
                return notes.filter(note => {
                    const noteDate = new Date(note.createdAt).toDateString();
                    return noteDate === today;
                });
            case 'important':
                return notes.filter(note => note.important);
            case 'all':
            default:
                return notes;
        }
    }

    createNoteHTML(note) {
        const createdDate = new Date(note.createdAt);
        const isToday = createdDate.toDateString() === new Date().toDateString();
        const dateDisplay = isToday ? 
            `Today, ${createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` :
            createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const updatedAt = note.updatedAt && note.updatedAt !== note.createdAt ? 
            ` • Edited ${new Date(note.updatedAt).toLocaleDateString()}` : '';

        const truncatedContent = note.content.length > 150 ? 
            note.content.substring(0, 150) + '...' : note.content;

        return `
            <div class="note-item ${note.important ? 'important' : ''}" data-note-id="${note.id}">
                <div class="note-header">
                    <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        ${note.important ? '<span class="importance-indicator">⭐</span>' : ''}
                        <button class="note-action-btn edit-note" title="Edit note">✏️</button>
                        <button class="note-action-btn delete-note" title="Delete note">🗑️</button>
                    </div>
                </div>
                <div class="note-content">${this.escapeHtml(truncatedContent)}</div>
                <div class="note-footer">
                    <span class="note-date">${dateDisplay}${updatedAt}</span>
                </div>
            </div>
        `;
    }

    attachNoteEventListeners() {
        // Edit note buttons
        const editBtns = document.querySelectorAll('.edit-note');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = e.target.closest('.note-item').dataset.noteId;
                this.editNote(noteId);
            });
        });

        // Delete note buttons
        const deleteBtns = document.querySelectorAll('.delete-note');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = e.target.closest('.note-item').dataset.noteId;
                this.deleteNote(noteId);
            });
        });

        // Note item click to expand/view
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.note-actions')) {
                    const noteId = item.dataset.noteId;
                    this.viewNote(noteId);
                }
            });
        });
    }

    showNoteModal(note = null) {
        const modal = document.getElementById('noteModal');
        const modalTitle = document.getElementById('modalTitle');
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const importantNote = document.getElementById('importantNote');

        if (!modal) return;

        // Reset form
        if (noteTitle) noteTitle.value = '';
        if (noteContent) noteContent.value = '';
        if (importantNote) importantNote.checked = false;

        if (note) {
            // Edit mode
            this.editingNoteId = note.id;
            if (modalTitle) modalTitle.textContent = 'Edit Note';
            if (noteTitle) noteTitle.value = note.title;
            if (noteContent) noteContent.value = note.content;
            if (importantNote) importantNote.checked = note.important;
        } else {
            // Add mode
            this.editingNoteId = null;
            if (modalTitle) modalTitle.textContent = 'Add New Note';
        }

        modal.classList.add('active');
        
        // Focus on title field
        setTimeout(() => {
            if (noteTitle) noteTitle.focus();
        }, 100);
    }

    hideNoteModal() {
        const modal = document.getElementById('noteModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingNoteId = null;
    }

    saveNote() {
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const importantNote = document.getElementById('importantNote');

        if (!noteTitle || !noteContent) return;

        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (!title && !content) {
            if (window.app) {
                window.app.showNotification('Please add a title or content for your note! ✍️', 'error');
            }
            return;
        }

        const noteData = {
            title: title || 'Untitled Note',
            content: content,
            important: importantNote ? importantNote.checked : false
        };

        try {
            if (this.editingNoteId) {
                // Update existing note
                const updatedNote = StorageManager.updateNote(this.editingNoteId, noteData);
                if (updatedNote) {
                    if (window.app) {
                        window.app.showNotification('Note updated successfully! 📝', 'success');
                    }
                }
            } else {
                // Add new note
                const newNote = StorageManager.addNote(noteData);
                if (newNote) {
                    if (window.app) {
                        window.app.showNotification('Note added successfully! 📝', 'success');
                    }
                }
            }

            this.loadNotes();
            this.hideNoteModal();
        } catch (error) {
            console.error('Error saving note:', error);
            if (window.app) {
                window.app.showNotification('Error saving note. Please try again.', 'error');
            }
        }
    }

    editNote(noteId) {
        const notes = StorageManager.getNotes();
        const note = notes.find(n => n.id === noteId);
        
        if (note) {
            this.showNoteModal(note);
        }
    }

    deleteNote(noteId) {
        const notes = StorageManager.getNotes();
        const note = notes.find(n => n.id === noteId);
        
        if (!note) return;

        // Confirm deletion
        const confirmed = confirm(`Are you sure you want to delete "${note.title}"?`);
        
        if (confirmed) {
            const success = StorageManager.deleteNote(noteId);
            if (success) {
                this.loadNotes();
                if (window.app) {
                    window.app.showNotification('Note deleted successfully! 🗑️', 'success');
                }
            }
        }
    }

    viewNote(noteId) {
        const notes = StorageManager.getNotes();
        const note = notes.find(n => n.id === noteId);
        
        if (note) {
            // For now, just edit the note when viewing
            // In the future, this could show a read-only view
            this.editNote(noteId);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Reload notes with new filter
        this.loadNotes();
    }

    autoSave() {
        if (!this.editingNoteId) return;

        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const importantNote = document.getElementById('importantNote');

        if (!noteTitle || !noteContent) return;

        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (title || content) {
            const noteData = {
                title: title || 'Untitled Note',
                content: content,
                important: importantNote ? importantNote.checked : false
            };

            StorageManager.updateNote(this.editingNoteId, noteData);
            console.log('Note auto-saved');
        }
    }

    getEmptyStateHTML() {
        const emptyMessages = {
            all: {
                icon: '📝',
                title: 'No notes yet',
                message: 'Start by adding your first note! Capture your thoughts, ideas, and daily reflections.'
            },
            today: {
                icon: '📅',
                title: 'No notes today',
                message: 'You haven\'t added any notes today. How about starting with what\'s on your mind?'
            },
            important: {
                icon: '⭐',
                title: 'No important notes',
                message: 'Mark notes as important by checking the star when creating or editing them.'
            }
        };

        const empty = emptyMessages[this.currentFilter] || emptyMessages.all;

        return `
            <div class="empty-state" style="text-align: center; padding: 3rem 1rem; color: #6b7280;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${empty.icon}</div>
                <h3 style="font-size: 1.25rem; color: #374151; margin-bottom: 0.5rem;">${empty.title}</h3>
                <p style="line-height: 1.6;">${empty.message}</p>
                ${this.currentFilter === 'all' ? 
                    '<button onclick="window.notesManager.showNoteModal()" style="margin-top: 2rem; background: #4F46E5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">Add Your First Note</button>' : 
                    ''
                }
            </div>
        `;
    }

    // Search functionality
    searchNotes(query) {
        const notes = StorageManager.getNotes();
        const searchQuery = query.toLowerCase();
        
        const filteredNotes = notes.filter(note => {
            return note.title.toLowerCase().includes(searchQuery) ||
                   note.content.toLowerCase().includes(searchQuery);
        });

        this.displayNotes(filteredNotes);
    }

    // Export notes
    exportNotes() {
        const notes = StorageManager.getNotes();
        const dataStr = JSON.stringify(notes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        if (window.app) {
            window.app.showNotification('Notes exported successfully! 💾', 'success');
        }
    }

    // Import notes
    importNotes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                
                if (Array.isArray(importedNotes)) {
                    importedNotes.forEach(note => {
                        StorageManager.addNote({
                            title: note.title || 'Imported Note',
                            content: note.content || '',
                            important: note.important || false
                        });
                    });
                    
                    this.loadNotes();
                    if (window.app) {
                        window.app.showNotification(`Imported ${importedNotes.length} notes! 📥`, 'success');
                    }
                }
            } catch (error) {
                console.error('Error importing notes:', error);
                if (window.app) {
                    window.app.showNotification('Error importing notes. Please check the file format.', 'error');
                }
            }
        };
        reader.readAsText(file);
    }

    // Get notes statistics
    getNotesStats() {
        const notes = StorageManager.getNotes();
        const today = new Date().toDateString();
        
        return {
            total: notes.length,
            important: notes.filter(note => note.important).length,
            today: notes.filter(note => new Date(note.createdAt).toDateString() === today).length,
            thisWeek: notes.filter(note => {
                const noteDate = new Date(note.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return noteDate >= weekAgo;
            }).length
        };
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Toggle importance of a note
    toggleImportance(noteId) {
        const notes = StorageManager.getNotes();
        const note = notes.find(n => n.id === noteId);
        
        if (note) {
            const updated = StorageManager.updateNote(noteId, {
                important: !note.important
            });
            
            if (updated) {
                this.loadNotes();
                const status = updated.important ? 'marked as important' : 'unmarked as important';
                if (window.app) {
                    window.app.showNotification(`Note ${status}! ${updated.important ? '⭐' : '📝'}`, 'success');
                }
            }
        }
    }
}

// Initialize notes manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notesManager = new NotesManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesManager;
}