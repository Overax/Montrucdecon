import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ICONS, NOTE_COLORS } from '../constants';
import { Note, NoteLink } from '../types';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const MIN_NOTE_SIZE = 50;


// --- Helper Functions ---
const screenToWorld = (x: number, y: number, pan: {x: number, y: number}, zoom: number) => ({
    x: (x - pan.x) / zoom,
    y: (y - pan.y) / zoom,
});

const getNoteCenter = (note: Note) => ({
    x: note.x + note.width / 2,
    y: note.y + note.height / 2,
});

// --- Sub-components ---

const Toolbar: React.FC<{
    note: Note,
    onUpdate: (id: string, updates: Partial<Note>) => void,
    onDelete: (id: string) => void,
    onLink: (id: string) => void
}> = ({ note, onUpdate, onDelete, onLink }) => {
    const colorClass = (color: string) => color.split(' ')[0].replace('bg-', 'ring-');

    return (
        <div className="absolute z-30 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-1 flex items-center space-x-1" style={{transform: 'translate(-50%, -100%)', top: -10, left: '50%'}}>
            {NOTE_COLORS.map(color => (
                <button key={color} onClick={() => onUpdate(note.id, { color })} className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${color.split(' ')[0]} ${note.color.startsWith(color.split(' ')[0]) ? `ring-2 ring-offset-2 dark:ring-offset-neutral-800 ${colorClass(color)}` : ''}`}></button>
            ))}
            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
            <button onClick={() => onLink(note.id)} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" title="Lier la note">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </button>
            <button onClick={() => onDelete(note.id)} className="p-1 rounded-md hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors" title="Supprimer la note">
                <ICONS.trash className="w-5 h-5" />
            </button>
        </div>
    );
};

const NoteItem: React.FC<{ 
    note: Note, 
    isSelected: boolean,
    onSelect: (e: React.PointerEvent, id: string) => void,
    onUpdate: (id: string, updates: Partial<Note>) => void,
    onDragStart: (e: React.PointerEvent, id: string) => void,
    onRotateStart: (e: React.PointerEvent, id: string) => void,
    onResizeStart: (e: React.PointerEvent, id: string, handle: string) => void,
    onDelete: (id: string) => void,
    onLinkStart: (id: string) => void,
    onLinkEnd: (id: string) => void,
}> = React.memo(({ note, isSelected, onSelect, onUpdate, onDragStart, onRotateStart, onResizeStart, onDelete, onLinkStart, onLinkEnd }) => {
    const [content, setContent] = useState(note.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isEditingRef = useRef(false);

    useEffect(() => {
      setContent(note.content);
    }, [note.content]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content, note.width, note.height]);
    
    const handleBlur = () => {
        if (content !== note.content) {
            onUpdate(note.id, { content });
        }
        isEditingRef.current = false;
    };
    
    const handleFocus = () => {
      isEditingRef.current = true;
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isEditingRef.current) return;
        onDragStart(e, note.id);
    };
    
    const resizeHandles: Record<string, string> = {
        tl: 'cursor-nwse-resize -top-1.5 -left-1.5',
        tr: 'cursor-nesw-resize -top-1.5 -right-1.5',
        bl: 'cursor-nesw-resize -bottom-1.5 -left-1.5',
        br: 'cursor-nwse-resize -bottom-1.5 -right-1.5',
    };

    return (
        <div
            id={`note-${note.id}`}
            className={`absolute group cursor-grab active:cursor-grabbing transform-gpu transition-shadow duration-200 ${isSelected ? 'shadow-2xl z-20' : 'shadow-md z-10'}`}
            style={{ 
                left: note.x, 
                top: note.y, 
                width: note.width, 
                height: note.height,
                transform: `rotate(${note.rotation}deg)`,
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.stopPropagation();
                onSelect(e, note.id);
                handlePointerDown(e);
              }
            }}
            onPointerUp={() => onLinkEnd(note.id)}
        >
            <div className={`relative w-full h-full rounded-lg border flex flex-col p-4 ${note.color}`}>
                {isSelected && <Toolbar note={note} onUpdate={onUpdate} onDelete={onDelete} onLink={onLinkStart} />}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    onPointerDown={e => e.stopPropagation()}
                    className="bg-transparent focus:outline-none resize-none w-full h-full text-sm font-medium flex-1"
                    placeholder="Écrivez quelque chose..."
                />
                {isSelected && (
                    <>
                    <div 
                        onPointerDown={(e) => { e.stopPropagation(); onRotateStart(e, note.id); }} 
                        className="absolute -top-2 -right-2 w-5 h-5 bg-white dark:bg-neutral-700 rounded-full border-2 border-primary-500 cursor-[alias] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                        title="Pivoter la note"
                    >
                       <svg className="w-3 h-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" /></svg>
                    </div>
                    {Object.entries(resizeHandles).map(([handle, className]) => (
                        <div
                            key={handle}
                            onPointerDown={(e) => { e.stopPropagation(); onResizeStart(e, note.id, handle); }}
                            className={`absolute w-3 h-3 bg-white dark:bg-neutral-700 border-2 border-primary-500 rounded-full z-30 ${className}`}
                            style={{ cursor: className.includes('nwse') ? 'nwse-resize' : 'nesw-resize' }}
                        />
                    ))}
                    </>
                )}
            </div>
        </div>
    );
});

// --- Main Component ---
const Notes: React.FC = () => {
    const { notes, addNote, updateNote, deleteNote, noteLinks, addNoteLink, deleteLinksForNote } = useAppContext();
    const boardRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef({ 
        type: 'none' as 'none' | 'pan' | 'drag' | 'rotate' | 'resize',
        startPoint: {x: 0, y: 0},
        noteId: '', 
        panStart: {x: 0, y: 0},
        initialNote: null as Note | null,
        handle: '' as string,
    });
    const [viewState, setViewState] = useState({ pan: { x: 300, y: 100 }, zoom: 1 });
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [linkingState, setLinkingState] = useState<{ from: string; to: {x: number, y: number}} | null>(null);
    
    const globalNotes = useMemo(() => notes.filter(n => !n.clientId), [notes]);
    const notesById = useMemo(() => new Map(globalNotes.map(note => [note.id, note])), [globalNotes]);

    const handleNoteUpdate = useCallback((id: string, updates: Partial<Note>) => updateNote(id, updates), [updateNote]);

    const handleNoteDelete = (id: string) => {
        deleteNote(id);
        deleteLinksForNote(id);
        if (selectedNoteId === id) {
            setSelectedNoteId(null);
        }
    }
    
    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button === 1 || e.altKey) { // Middle mouse or Alt+Click to pan
            e.preventDefault();
            interactionRef.current = { type: 'pan', startPoint: { x: e.clientX, y: e.clientY }, noteId: '', panStart: viewState.pan, initialNote: null, handle: '' };
        } else if ((e.target as HTMLElement).contains(boardRef.current) && (e.target as HTMLElement) !== boardRef.current) {
            // Click was on something else, deselect
        }
        else {
             setSelectedNoteId(null);
        }
    };
    
    const handlePointerMove = (e: React.PointerEvent) => {
        const { type, startPoint, noteId, panStart } = interactionRef.current;
        const note = noteId ? notesById.get(noteId) : null;

        if (type === 'pan') {
            const dx = e.clientX - startPoint.x;
            const dy = e.clientY - startPoint.y;
            setViewState(prev => ({ ...prev, pan: { x: panStart.x + dx, y: panStart.y + dy } }));
        } else if (type === 'drag' && note) {
            const dx = (e.clientX - startPoint.x) / viewState.zoom;
            const dy = (e.clientY - startPoint.y) / viewState.zoom;
            const newX = panStart.x + dx;
            const newY = panStart.y + dy;
            const noteEl = document.getElementById(`note-${noteId}`);
            if (noteEl) {
              noteEl.style.left = `${newX}px`;
              noteEl.style.top = `${newY}px`;
            }
        } else if (type === 'rotate' && note) {
            const center = getNoteCenter(note);
            const worldStart = screenToWorld(startPoint.x, startPoint.y, viewState.pan, viewState.zoom);
            const worldCurrent = screenToWorld(e.clientX, e.clientY, viewState.pan, viewState.zoom);
            const startAngle = Math.atan2(worldStart.y - center.y, worldStart.x - center.x);
            const currentAngle = Math.atan2(worldCurrent.y - center.y, worldCurrent.x - center.x);
            const angleDiff = (currentAngle - startAngle) * 180 / Math.PI;
            const newRotation = panStart.x + angleDiff; // panStart.x stores initial rotation here
            const noteEl = document.getElementById(`note-${noteId}`);
            if (noteEl) {
               noteEl.style.transform = `rotate(${newRotation}deg)`;
            }
        } else if (type === 'resize' && noteId) {
            const { initialNote, handle, startPoint } = interactionRef.current;
            if (!initialNote) return;

            const noteEl = document.getElementById(`note-${noteId}`);
            if (!noteEl) return;
            
            const dx = (e.clientX - startPoint.x) / viewState.zoom;
            const dy = (e.clientY - startPoint.y) / viewState.zoom;

            const theta = initialNote.rotation * Math.PI / 180;
            const cos_t = Math.cos(theta);
            const sin_t = Math.sin(theta);
            
            const rotated_dx = dx * cos_t + dy * sin_t;
            const rotated_dy = -dx * sin_t + dy * cos_t;
            
            let dw = 0, dh = 0;
            if (handle.includes('r')) dw = rotated_dx;
            if (handle.includes('l')) dw = -rotated_dx;
            if (handle.includes('b')) dh = rotated_dy;
            if (handle.includes('t')) dh = -rotated_dy;
            
            let newWidth = initialNote.width + dw;
            let newHeight = initialNote.height + dh;

            if (newWidth < MIN_NOTE_SIZE) {
                dw -= (newWidth - MIN_NOTE_SIZE);
                newWidth = MIN_NOTE_SIZE;
            }
            if (newHeight < MIN_NOTE_SIZE) {
                dh -= (newHeight - MIN_NOTE_SIZE);
                newHeight = MIN_NOTE_SIZE;
            }

            const centerX = initialNote.x + initialNote.width / 2;
            const centerY = initialNote.y + initialNote.height / 2;

            const shiftX = dw / 2;
            const shiftY = dh / 2;

            const cx_local_shift = handle.includes('l') ? -shiftX : shiftX;
            const cy_local_shift = handle.includes('t') ? -shiftY : shiftY;

            const cx_world_shift = cx_local_shift * cos_t - cy_local_shift * sin_t;
            const cy_world_shift = cx_local_shift * sin_t + cy_local_shift * cos_t;
            
            const newCenterX = centerX + cx_world_shift;
            const newCenterY = centerY + cy_world_shift;
            
            const newX = newCenterX - newWidth / 2;
            const newY = newCenterY - newHeight / 2;

            noteEl.style.left = `${newX}px`;
            noteEl.style.top = `${newY}px`;
            noteEl.style.width = `${newWidth}px`;
            noteEl.style.height = `${newHeight}px`;

        } else if (linkingState) {
            const worldPos = screenToWorld(e.clientX, e.clientY, viewState.pan, viewState.zoom);
            setLinkingState(prev => prev ? {...prev, to: worldPos } : null);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (boardRef.current && e.pointerId) {
            boardRef.current.releasePointerCapture(e.pointerId);
        }
        const { type, noteId } = interactionRef.current;
        const note = noteId ? notesById.get(noteId) : null;
        
        if (type === 'drag' && note) {
            const noteEl = document.getElementById(`note-${noteId}`);
            if (noteEl) {
              updateNote(noteId, { x: parseFloat(noteEl.style.left), y: parseFloat(noteEl.style.top) });
            }
        } else if (type === 'rotate' && note) {
            const noteEl = document.getElementById(`note-${noteId}`);
            if (noteEl) {
                const transform = noteEl.style.transform;
                const rotation = parseFloat(transform.substring(transform.indexOf('(') + 1, transform.indexOf('deg')));
                updateNote(noteId, { rotation });
            }
        } else if (type === 'resize' && noteId) {
            const noteEl = document.getElementById(`note-${noteId}`);
            if (noteEl) {
                updateNote(noteId, {
                    x: parseFloat(noteEl.style.left),
                    y: parseFloat(noteEl.style.top),
                    width: parseFloat(noteEl.style.width),
                    height: parseFloat(noteEl.style.height),
                });
            }
        }
        interactionRef.current = { type: 'none', startPoint: {x: 0, y: 0}, noteId: '', panStart: {x: 0, y: 0}, initialNote: null, handle: '' };
    };
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newZoom = viewState.zoom - e.deltaY * 0.001;
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        const zoomRatio = clampedZoom / viewState.zoom;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const newPanX = mouseX - (mouseX - viewState.pan.x) * zoomRatio;
        const newPanY = mouseY - (mouseY - viewState.pan.y) * zoomRatio;

        setViewState({ pan: { x: newPanX, y: newPanY }, zoom: clampedZoom });
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.absolute.group')) return;

        const { x, y } = screenToWorld(e.clientX, e.clientY, viewState.pan, viewState.zoom);
        const newNote = addNote({
            x: x - 96,
            y: y - 96,
        });
        setSelectedNoteId(newNote.id);
    };

    const handleNoteDragStart = (e: React.PointerEvent, id: string) => {
        const note = notesById.get(id);
        if (!note || !boardRef.current) return;
        boardRef.current.setPointerCapture(e.pointerId);
        interactionRef.current = { type: 'drag', noteId: id, startPoint: { x: e.clientX, y: e.clientY }, panStart: { x: note.x, y: note.y }, initialNote: null, handle: '' };
    };

    const handleNoteRotateStart = (e: React.PointerEvent, id: string) => {
        const note = notesById.get(id);
        if (!note || !boardRef.current) return;
        boardRef.current.setPointerCapture(e.pointerId);
        interactionRef.current = { type: 'rotate', noteId: id, startPoint: { x: e.clientX, y: e.clientY }, panStart: { x: note.rotation, y: 0 }, initialNote: null, handle: '' };
    };

    const handleNoteResizeStart = (e: React.PointerEvent, id: string, handle: string) => {
        const note = notesById.get(id);
        if (!note || !boardRef.current) return;
        boardRef.current.setPointerCapture(e.pointerId);
        e.stopPropagation();
        interactionRef.current = {
            type: 'resize',
            noteId: id,
            startPoint: { x: e.clientX, y: e.clientY },
            initialNote: { ...note },
            handle,
            panStart: { x: 0, y: 0 }, // Not used for resize
        };
    };

    const handleStartLinking = (id: string) => {
        const startPos = getNoteCenter(notesById.get(id)!);
        setLinkingState({ from: id, to: startPos });
        setSelectedNoteId(null);
    };
    
    const handleEndLinking = (id: string) => {
        if (linkingState) {
            addNoteLink(linkingState.from, id);
            setLinkingState(null);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && linkingState) {
                setLinkingState(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [linkingState]);

    useEffect(() => {
        const handleCreateNewNote = () => {
            if (!boardRef.current) return;
    
            const boardRect = boardRef.current.getBoundingClientRect();
            const centerX = boardRect.left + boardRect.width / 2;
            const centerY = boardRect.top + boardRect.height / 2;
            
            const worldCoords = screenToWorld(centerX, centerY, viewState.pan, viewState.zoom);
    
            const newNote = addNote({
                x: worldCoords.x - 96, // center note
                y: worldCoords.y - 96,
            });
            setSelectedNoteId(newNote.id);
        };
    
        document.addEventListener('createNewNote', handleCreateNewNote);
    
        return () => {
            document.removeEventListener('createNewNote', handleCreateNewNote);
        };
    }, [addNote, viewState.pan, viewState.zoom]);
    

    return (
        <div 
            ref={boardRef}
            className="w-full h-full relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-lg bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] dark:bg-[radial-gradient(#44403c_1px,transparent_1px)] [background-size:16px_16px] touch-none"
            style={{ cursor: interactionRef.current.type === 'pan' ? 'grabbing' : 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
        >
            <div
                className="absolute top-0 left-0"
                style={{ transform: `translate(${viewState.pan.x}px, ${viewState.pan.y}px) scale(${viewState.zoom})`, transformOrigin: '0 0' }}
            >
                {/* SVG Links Layer */}
                <svg className="absolute top-0 left-0 w-px h-px overflow-visible" style={{ pointerEvents: 'none' }}>
                    {noteLinks.map(link => {
                        const fromNote = notesById.get(link.from);
                        const toNote = notesById.get(link.to);
                        if (!fromNote || !toNote) return null;
                        const fromCenter = getNoteCenter(fromNote);
                        const toCenter = getNoteCenter(toNote);
                        return <path key={link.id} d={`M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`} stroke="currentColor" strokeWidth="2" className="text-neutral-400 dark:text-neutral-600"/>
                    })}
                    {linkingState && (
                        <path d={`M ${getNoteCenter(notesById.get(linkingState.from)!).x} ${getNoteCenter(notesById.get(linkingState.from)!).y} L ${linkingState.to.x} ${linkingState.to.y}`} strokeDasharray="5,5" stroke="currentColor" strokeWidth="2" className="text-primary-500" />
                    )}
                </svg>

                {/* Notes Layer */}
                {globalNotes.map(note => (
                    <NoteItem
                        key={note.id}
                        note={note}
                        isSelected={selectedNoteId === note.id}
                        onSelect={(e, id) => { e.stopPropagation(); setSelectedNoteId(id); }}
                        onUpdate={handleNoteUpdate}
                        onDragStart={handleNoteDragStart}
                        onRotateStart={handleNoteRotateStart}
                        onResizeStart={handleNoteResizeStart}
                        onDelete={handleNoteDelete}
                        onLinkStart={handleStartLinking}
                        onLinkEnd={handleEndLinking}
                    />
                ))}
            </div>

            <div className="absolute top-4 left-4 z-30 text-xs text-neutral-400 bg-black/20 p-1 rounded backdrop-blur-sm">
                Pan: Alt+Drag / Middle Click | Zoom: Scroll | New Note: Double Click
            </div>
        </div>
    );
};

export default Notes;
