import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ДОДАНО
import { type Position } from "../../../types/Position";
import API_URL from "../../../env";
import { useTranslation } from 'react-i18next';
import ButtonC2 from "../../../components/Buttons/ButtonC2/ButtonC2"; // ДОДАНО

// Припустимо, що цей маршрут веде до списку позицій після видалення
const HOME_ROUTE = '/info'; 

interface PositionParameter {
    title: string;
    description: string;
    point: number;
}

interface PositionData {
    name: string;
    parameters: PositionParameter[];
}

interface PositionViewProps {
    id: string;
}

const PositionView = ({ id }: PositionViewProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate(); // Ініціалізація useNavigate
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [position, setPosition] = useState<PositionData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false); // Стан видалення
    
    // Кінцеві точки API
    const API_END_POINT = API_URL.BACK_END_URL + API_URL.GET_POSITION_ENDPOINT + "/" + id;
    const DELETE_END_POINT = API_URL.BACK_END_URL + '/position/delete/' + id; // КІНЦЕВА ТОЧКА ВИДАЛЕННЯ

    // Функція для отримання локалізованого рядка
    const tp = (key: string) => String(t(`PositionView.${key}`)); 

    // --- ЛОГІКА ЗАВАНТАЖЕННЯ ---
    useEffect(() => {
        fetch(API_END_POINT, { method: 'GET', credentials: 'include' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} - ${tp('errors.failedToLoad')}`);
                }
                return response.json();
            }).then((data: PositionData) => {
                setPosition(data);
                setLoading(false);
            }).catch((err) => {
                console.error('Error fetching position:', err);
                const errorMessage = err.message || tp('errors.unknownError');
                setError(errorMessage);
                setLoading(false);
            });
    }, [id, API_END_POINT, t]);

    // --- ЛОГІКА ВИДАЛЕННЯ ---
    const handleDelete = async () => {
        // Підтвердження видалення з локалізацією
        const confirmMessage = tp('confirmDeletePosition').replace('{name}', position?.name || 'цей елемент');

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(DELETE_END_POINT, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || tp('errors.failedToDeletePosition')}`);
            }

            // Успіх: Перенаправляємо
            const successAlertMessage = tp('deletePositionSuccess').replace('{name}', position?.name || '');
            alert(successAlertMessage);
            navigate(HOME_ROUTE); // Перенаправлення

        } catch (err) {
            const unknownDeleteError = tp('errors.unknownDeleteError');
            const errorMessage = (err instanceof Error) ? err.message : unknownDeleteError;
            
            setError(errorMessage);
            alert(`${tp('deleteErrorPrefix')}: ${errorMessage}`);
            console.error('Error deleting position:', err);
        } finally {
            setIsDeleting(false);
        }
    };


    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>{tp('loading')}</div>;

    if (error) return <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>{tp('errorPrefix')}: {error}</div>;

    if (!position) return <div style={{ padding: '20px' }}>{tp('notFound')}</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
                <ButtonC2
                    text={isDeleting ? tp('deleting') : tp('deleteButton')}
                    onClick={handleDelete}
                    disabled={isDeleting}
                />
            </div>

            <h1 style={{ borderBottom: '3px solid #007bff', paddingBottom: '10px', marginBottom: '30px' }}>
                {position.name}
            </h1>

            <section>
                <h2 style={{ color: '#333' }}>{tp('parametersTitle')}</h2>
                
                {position.parameters.length === 0 ? (
                    <p>{tp('noParameters')}</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {position.parameters.map((param, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    border: '1px solid #ccc', 
                                    padding: '15px', 
                                    borderRadius: '8px', 
                                    boxShadow: '2px 2px 5px rgba(0,0,0,0.05)',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
                                        {index + 1}. {param.title}
                                    </h4>
                                    <span style={{ 
                                        fontWeight: 'bold', 
                                        fontSize: '1.2em', 
                                        color: '#28a745',
                                        backgroundColor: '#e2f0d9',
                                        padding: '5px 10px',
                                        borderRadius: '5px'
                                    }}>
                                        {tp('weight')}: {param.point} 
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.95em', color: '#555' }}>
                                    {param.description || tp('noDescription')} 
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <details style={{ marginTop: '40px' }}>
                <summary style={{ cursor: 'pointer', color: '#007bff' }}>{tp('debugJson')}</summary>
                <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
                    {JSON.stringify(position, null, 2)}
                </pre>
            </details>
        </div>
    );
}

export default PositionView;