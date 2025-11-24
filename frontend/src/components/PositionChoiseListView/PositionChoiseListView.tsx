import React, { useState, useEffect } from 'react';
import API_URL from '../../env'; 

interface EnvAPI {
    BACK_END_URL: string;
    GET_LIST_POSITION: string; 
}

interface PositionItem {
    id: string;
    name: string;
}

interface PositionChoiseListViewProps {
    onPositionSelect: (position: PositionItem | null) => void;
    onListStateChange: (hasItems: boolean) => void; 
}

const PositionChoiseListView: React.FC<PositionChoiseListViewProps> = ({ onPositionSelect, onListStateChange }) => {
    const [positions, setPositions] = useState<PositionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);


    const API_END_POINT = API_URL.BACK_END_URL + API_URL.GET_LIST_POSITION;

    useEffect(() => {
        fetch(API_END_POINT, { method: 'GET', credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} - Failed to fetch positions`);
                }
                return response.json();
            })
            .then((data: PositionItem[] | { items: PositionItem[] }) => {
                const list = Array.isArray(data) ? data : data.items || [];
                setPositions(list);
                setLoading(false);
                
                onListStateChange(list.length > 0); 
            })
            .catch(err => {
                console.error('Error fetching positions:', err);
                setError(err.message || 'Unknown error');
                setLoading(false);
                
                onListStateChange(false); 
            });
    }, [API_END_POINT, onListStateChange]);

    const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedId(id);

        const selectedPosition = positions.find(p => p.id === id) || null;
        onPositionSelect(selectedPosition);
    };

    if (loading) {
        return <div style={{ padding: 10 }}>Завантаження позицій...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', padding: 10 }}>Помилка завантаження: {error}</div>;
    }

    return (
        <div style={{ padding: 10 }}>
            <label htmlFor="position-select" style={{ display: 'block', marginBottom: 5 }}>
                Виберіть позицію:
            </label>
            <select
                id="position-select"
                value={selectedId || ''}
                onChange={handleSelection}
                style={{ width: '100%', padding: 8, fontSize: 16 }}
            >
                <option value="" disabled>-- Не вибрано --</option>
                {positions.map(position => (
                    <option key={position.id} value={position.id}>
                        {position.name}
                    </option>
                ))}
            </select>
            {positions.length === 0 && <p style={{ marginTop: 10, color: '#666' }}>Список позицій порожній.</p>}
        </div>
    );
}

export default PositionChoiseListView;