import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';


import  { API_ENDPOINTS, HOME_ROUTE } from "../../../env"; 

import ButtonC2 from "../../../components/Buttons/ButtonC2/ButtonC2";
import ButtonDownloadFile from "../../../components/Buttons/ButtonDownloadFile/ButtonDownloadFile";

interface WorkExperience { 
    years: string; 
    company: string; 
    industry: string; 
    position: string; 
    duration_years: string; 
    responsibilities: string; 
}

interface Education { 
    years: string; 
    degree: string; 
    institution: string; 
    specialization: string; 
}

interface Certification { 
    name: string; 
    year?: string; 
    institution?: string; 
}

interface CandidateProfile { 
    skills: string[]; 
    contacts: { [key: string]: string }; 
    education: Education[]; 
    full_name: string; 
    languages: string[]; 
    date_of_birth: string; 
    certifications: (string | Certification)[]; 
    additional_info: string; 
    work_experience: WorkExperience[]; 
}

interface Evaluation { 
    trust_score: number; 
    integrity_score: number; 
    overall_profile_index: number; 
    leadership_maturity_score: number; 
    relevance_to_position_score: number; 
}

interface RiskAnalysis { 
    notes: string; 
    competency_mismatch: boolean; 
    disciplinary_issues: boolean; 
    conflict_of_interest: boolean; 
    frequent_job_changes: boolean; 
}

interface PositionRelevance { 
    overall_score: number; 
    experience_relevance: string; 
    key_competencies_match: string; 
    responsibility_level_match: string; 
}

interface ProfileData { 
    candidate: CandidateProfile; 
    evaluation: Evaluation; 
    risk_analysis: RiskAnalysis; 
    position_relevance: PositionRelevance; 
    summary_conclusion: string; 
}

interface FileData { 
    id: string; 
    file_name: string; 
    content_type: string; 
    file_size: number; 
    candidate_id: string; 
}

interface UserData { 
    id: string; 
    profile: ProfileData; 
    files: FileData[]; 
    error_files?: any[]; 
    position_id?: string; 
}

interface PositionListApiItem { 
    id: string; 
    name: string; 
}

interface ProfileViewProps { 
    id: string; 
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 style={{ 
        borderBottom: '2px solid var(--c1)', 
        paddingBottom: 'var(--gap)', 
        marginTop: 'calc(var(--gap) * 2)', 
        marginBottom: 'var(--gap)',
        color: 'var(--text)'
    }}>{title}</h3>
);

const ExperienceItem: React.FC<{ item: WorkExperience, t: (key: string) => string }> = ({ item, t }) => (
    <li style={{ 
        borderLeft: '3px solid var(--c6)', 
        paddingLeft: 'var(--gap)', 
        marginBottom: 'var(--gap)',
        position: 'relative'
    }}>
        <div style={{
            position: 'absolute',
            left: '-7px',
            top: '0',
            width: '12px',
            height: '12px',
            backgroundColor: 'var(--c1)',
            borderRadius: '50%',
            boxShadow: '0 0 0 3px var(--bg)'
        }}></div>
        <p style={{ margin: 0 }}><strong>{item.position}</strong> ({item.years})</p>
        <p style={{ margin: '3px 0 5px 0', color: 'var(--c1)', fontWeight: '500' }}>
            {item.company} | {item.duration_years} {t('ProfileView.yearsAbbreviation')}.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '0.9em', color: '#555' }}>
            {t('ProfileView.responsibilities')}: {item.responsibilities}
        </p>
    </li>
);

const ScoreBadge: React.FC<{ label: string; score: number }> = ({ label, score }) => {
    let bgColor;
    let textColor = 'var(--text)'; 
    if (score >= 8) {
        bgColor = 'var(--c4)'; 
        textColor = 'var(--text-alt)';
    } else if (score >= 6) {
        bgColor = 'var(--c6)'; 
    } else {
        bgColor = 'var(--alert)'; 
        textColor = 'var(--text-alt)';
    }

    return (
        <div style={{ 
            display: 'inline-block', 
            padding: '8px 15px', 
            margin: '5px', 
            borderRadius: 'var(--radius)', 
            backgroundColor: bgColor,
            color: textColor,
            fontWeight: '600',
            transition: 'background-color 0.3s'
        }}>
            {label}: <span style={{ fontWeight: '700' }}>{score}</span>
        </div>
    );
};

const ProfileView = ({ id }: ProfileViewProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [positionName, setPositionName] = useState<string | null>(null);
    const [positionsLoading, setPositionsLoading] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false); 

    const tp = useCallback((key: string) => String(t(`ProfileView.${key}`)), [t]);

    const apiEndpoints = useMemo(() => ({
        GET_PROFILE: API_ENDPOINTS.CANDIDATE.GET_ONE(id),
        DELETE_PROFILE: API_ENDPOINTS.CANDIDATE.DELETE(id),
        GET_ALL_POSITIONS: API_ENDPOINTS.POSITION.GET_ALL,
    }), [id]);

    useEffect(() => {
        setLoading(true);
        fetch(apiEndpoints.GET_PROFILE, { method: 'GET', credentials: 'include' })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status} - ${tp('errors.failedToLoad')}`);
            }
            return response.json();
          })
          .then((data: UserData) => {
            setUser(data);
            setLoading(false);
          })
          .catch((err) => {
            const errorMessage = err.message || tp('errors.unknownError');
            setError(errorMessage);
            setLoading(false);
          });
    }, [id, apiEndpoints.GET_PROFILE, tp]);


    useEffect(() => {
        if (user?.id && user.position_id) {
            setPositionsLoading(true);
            fetch(apiEndpoints.GET_ALL_POSITIONS, { method: 'GET', credentials: 'include' })
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch positions list");
                    return res.json();
                })
                .then((data: PositionListApiItem[] | { items: PositionListApiItem[] }) => {
                    const list = Array.isArray(data) ? data : data.items || [];
                    const matchedPosition = list.find(p => p.id === user.position_id);
                    
                    if (matchedPosition) {
                        setPositionName(matchedPosition.name);
                    } else {
                        setPositionName(tp('positionNotFound')); 
                    }
                })
                .catch(err => {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    setPositionName(`${tp('positionError')} (Деталі: ${errorMessage})`); 
                })
                .finally(() => {
                    setPositionsLoading(false);
                });
        } else if (user && !user.position_id) {
            setPositionName(tp('positionNotAssigned')); 
        }
    }, [user?.id, user?.position_id, apiEndpoints.GET_ALL_POSITIONS, tp]); 
  
    const isTotalLoading = loading || positionsLoading;

    const handleDelete = useCallback(async () => {
        const fullName = user?.profile.candidate.full_name || '';
        const confirmMessage = tp('confirmDelete').replace('{name}', fullName);

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(apiEndpoints.DELETE_PROFILE, { method: 'DELETE', credentials: 'include' });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || tp('errors.failedToDelete')}`);
            }

            const successAlertMessage = tp('deleteSuccess').replace('{name}', fullName);
            alert(successAlertMessage);
            navigate(HOME_ROUTE);

        } catch (err) {
            const unknownDeleteError = tp('errors.unknownDeleteError');
            const errorMessage = (err instanceof Error) ? err.message : unknownDeleteError;
            setError(errorMessage);
            alert(`${tp('deleteErrorPrefix')}: ${errorMessage}`);
        } finally {
            setIsDeleting(false);
        }
    }, [user, apiEndpoints.DELETE_PROFILE, navigate, tp]);


    const handleExport = useCallback((format: string) => {
        if (!user) return;
        
        const fullUrl = API_ENDPOINTS.CANDIDATE.EXPORT(user.id, format);
        
        const a = document.createElement('a');
        a.href = fullUrl;
        a.download = `${user.profile.candidate.full_name}_${id}.${format}`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setShowExportOptions(false); 
    }, [user, id]);


    if (isTotalLoading) return <div style={{ color: 'var(--c1)', padding: '20px', textAlign: 'center' }}>{tp('loading')}</div>; 
    if (error) return <div style={{ color: 'var(--alert)', padding: '20px', border: '1px solid var(--alert)', margin: '20px', borderRadius: 'var(--radius)' }}>{tp('errorPrefix')}: {error}</div>;
    if (!user || !user.profile) return <div style={{ padding: '20px', color: 'var(--c6)' }}>{tp('notFound')}</div>;

    const profile = user.profile.candidate;
    const evaluation = user.profile.evaluation;
    const risk = user.profile.risk_analysis;
    const relevance = user.profile.position_relevance;

    const primaryFile = user.files && user.files.length > 0 ? user.files[0] : null;
    const downloadUrl = primaryFile ? API_ENDPOINTS.MINIO.DOWNLOAD(primaryFile.id) : undefined;
    
    const exportFormats = [
        { format: 'json', label: 'JSON' },
        { format: 'csv', label: 'CSV' },
        { format: 'word', label: 'Word (DOCX)' },
        { format: 'pdf', label: 'PDF' }
    ];

    return (
        <div style={{ 
            maxWidth: '1000px', 
            margin: 'var(--gap) auto', 
            padding: 'calc(var(--gap) * 2)', 
            fontFamily: 'var(--font)', 
            backgroundColor: 'var(--text-alt)', 
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'calc(var(--gap) * 2)' }}>
                <div>
                    <h1 style={{ color: 'var(--c1)', margin: 0 }}>{profile.full_name}</h1>
                    <p style={{ color: 'var(--c6)', margin: '5px 0 0 0', fontWeight: '500' }}>{tp('candidateId')}: {user.id}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                    
                    <ButtonC2 
                        text={tp('exportButton')} 
                        onClick={() => setShowExportOptions(prev => !prev)}
                        disabled={isDeleting}
                    />

                    {showExportOptions && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            right: 0, 
                            zIndex: 10, 
                            backgroundColor: 'var(--text-alt)', 
                            border: '1px solid var(--c6)', 
                            borderRadius: 'var(--radius)', 
                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)', 
                            marginTop: '5px', 
                            padding: '5px 0',
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}>
                            {exportFormats.map(({ format, label }) => (
                                <button
                                    key={format}
                                    onClick={() => handleExport(format)}
                                    style={{ 
                                        padding: '10px 20px', 
                                        border: 'none', 
                                        backgroundColor: 'transparent', 
                                        cursor: 'pointer', 
                                        textAlign: 'left',
                                        color: 'var(--text)',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {tp('exportAs')} <strong style={{ color: 'var(--c1)' }}>{label}</strong>
                                </button>
                            ))}
                        </div>
                    )}

                    {primaryFile && downloadUrl && (
                        <ButtonDownloadFile 
                            title={`${tp('downloadCV')} (${primaryFile.file_name})`} 
                            sourceUrl={downloadUrl} 
                        />
                    )}
                    
                    <ButtonC2 
                        text={isDeleting ? tp('deleting') : tp('deleteButton')} 
                        onClick={handleDelete} 
                        disabled={isDeleting} 
                    />
                </div>
            </div>

            <div style={{ marginBottom: 'calc(var(--gap) * 2)', padding: 'var(--gap)', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius)', borderLeft: '5px solid var(--c1)' }}>
                <strong>{tp('position')}:</strong> 
                <span style={{ 
                    color: positionName && positionName.includes('Error') ? 'var(--alert)' : 'var(--c1)', 
                    fontWeight: '600',
                    marginLeft: '8px'
                }}>
                    {positionName || tp('positionUnknown')}
                </span>
            </div>

            <div style={{ border: '1px solid var(--c1)', padding: 'var(--gap)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg)', marginBottom: 'calc(var(--gap) * 2)' }}>
                <h4 style={{ color: 'var(--c1)', marginTop: '0', borderBottom: '1px solid var(--c6)', paddingBottom: '5px' }}>{tp('summaryTitle')}</h4>
                <p>{user.profile.summary_conclusion}</p>
            </div>

            <SectionHeader title={tp('basicInfo')} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--gap) * 2)' }}>
                <p><strong>{tp('birthDate')}:</strong> {profile.date_of_birth}</p>
                <p><strong>{tp('contacts')}:</strong> {profile.contacts.email} | {profile.contacts.phone}</p>
                <p><strong>{tp('location')}:</strong> {profile.contacts.location}</p>
                <p><strong>{tp('additionalInfo')}:</strong> {profile.additional_info}</p>
            </div>

            <SectionHeader title={tp('skillsTitle')} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--gap)' }}>
                {profile.skills.map(skill => (
                    <span key={skill} style={{ 
                        backgroundColor: 'var(--c6)', 
                        color: 'var(--text)',
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.85em',
                        fontWeight: '500' 
                    }}>{skill}</span>
                ))}
            </div>

            <SectionHeader title={tp('experienceTitle')} />
            <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                {profile.work_experience.map((exp, index) => (<ExperienceItem key={index} item={exp} t={t} />))}
            </ul>

            <SectionHeader title={tp('educationTitle')} />
            {profile.education.map((edu, index) => (
                <p key={index} style={{ margin: '8px 0', borderLeft: '4px solid var(--c2)', paddingLeft: '10px' }}>
                    <strong style={{ color: 'var(--c1)' }}>{edu.degree}</strong> ({edu.years}) <br /> 
                    <span style={{ fontSize: '0.95em' }}>{edu.institution}, {edu.specialization}</span>
                </p>
            ))}
            {profile.certifications.length > 0 && (
                <p style={{ marginTop: 'var(--gap)', borderTop: '1px solid var(--c6)', paddingTop: 'var(--gap)' }}>
                    <strong style={{ color: 'var(--c3)' }}>{tp('certifications')}:</strong> 
                    {profile.certifications.map(c => typeof c === 'string' ? c : c.name).join(', ')}
                </p>
            )}

            <SectionHeader title={tp('analysisTitle')} />
            <div>
                <h4 style={{ marginBottom: 'var(--gap)', color: 'var(--c1)' }}>{tp('keyIndicators')}:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap)' }}>
                    <ScoreBadge label={tp('labels.trust')} score={evaluation.trust_score} />
                    <ScoreBadge label={tp('labels.integrity')} score={evaluation.integrity_score} />
                    <ScoreBadge label={tp('labels.overall')} score={evaluation.overall_profile_index} />
                    <ScoreBadge label={tp('labels.leadership')} score={evaluation.leadership_maturity_score} />
                    <ScoreBadge label={tp('labels.relevance')} score={evaluation.relevance_to_position_score} />
                </div>
            </div>

            <div style={{ 
                marginTop: 'calc(var(--gap) * 2)', 
                padding: 'var(--gap)', 
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius)'
            }}>
                <h4 style={{ marginBottom: '5px', color: 'var(--c2)' }}>{tp('relevanceTitle')}:</h4>
                <p><strong>{tp('relevance.overallScore')}:</strong> <span style={{ color: 'var(--c1)', fontWeight: '600' }}>{relevance.overall_score}/10</span></p>
                <p><strong>{tp('relevance.experience')}:</strong> {relevance.experience_relevance}</p>
                <p><strong>{tp('relevance.competencies')}:</strong> {relevance.key_competencies_match}</p>
                <p><strong>{tp('relevance.level')}:</strong> {relevance.responsibility_level_match}</p>
            </div>

            <div style={{ 
                marginTop: 'calc(var(--gap) * 2)', 
                padding: 'var(--gap)', 
                borderRadius: 'var(--radius)',
                border: risk.notes ? '2px solid var(--alert)' : '1px solid var(--c6)',
                backgroundColor: risk.notes ? 'rgba(250, 45, 45, 0.05)' : 'transparent'
            }}>
                <h4 style={{ color: risk.notes ? 'var(--alert)' : 'var(--text)', marginTop: '0' }}>{tp('riskTitle')}:</h4>
                {risk.notes && <p style={{ color: 'var(--alert)', fontWeight: '600' }}>**{tp('risk.attention')}:** {risk.notes}</p>}
                <p><strong>{tp('risk.frequentJobChanges')}:</strong> <span style={{ color: risk.frequent_job_changes ? 'var(--alert)' : 'var(--c4)' }}>{risk.frequent_job_changes ? tp('risk.yes') : tp('risk.no')}</span></p>
                <p><strong>{tp('risk.competencyMismatch')}:</strong> <span style={{ color: risk.competency_mismatch ? 'var(--alert)' : 'var(--c4)' }}>{risk.competency_mismatch ? tp('risk.yes') : tp('risk.no')}</span></p>
            </div>

            <details style={{ marginTop: 'calc(var(--gap) * 3)', borderTop: '1px solid var(--c6)', paddingTop: 'var(--gap)' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--c1)', fontWeight: '600' }}>{tp('debugJson')}</summary>
                <pre style={{ 
                    backgroundColor: 'var(--text)', 
                    color: 'var(--c6)',
                    padding: 'var(--gap)', 
                    borderRadius: 'var(--radius)', 
                    overflowX: 'auto',
                    fontSize: '0.8em'
                }}>
                    {JSON.stringify(user, null, 2)}
                </pre>
            </details>
        </div>
    );
};

export default ProfileView;