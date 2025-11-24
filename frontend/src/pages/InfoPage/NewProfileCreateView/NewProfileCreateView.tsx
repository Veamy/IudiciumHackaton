import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadFileButton from '../../../components/UploadFileButton/UploadFileButton';
import UploadedFileListView from '../../../components/UploadedFileListView/UploadedFileListView';
import ROUTES from '../../../ROUTES';
import { useTranslation } from 'react-i18next';
import PositionChoiseListView from '../../../components/PositionChoiseListView/PositionChoiseListView';

const STYLE_CONSTANTS = {
  PRIMARY_COLOR: '#007bff',
  SECONDARY_COLOR: '#6c757d',
  BG_COLOR: '#f8f9fa',
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: STYLE_CONSTANTS.BG_COLOR,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    borderBottom: `2px solid ${STYLE_CONSTANTS.PRIMARY_COLOR}`,
    paddingBottom: '10px',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    boxSizing: 'border-box',
    resize: 'vertical',
    border: `1px solid #ced4da`,
    borderRadius: '4px',
  },
  primaryButton: {
    padding: '10px 24px',
    backgroundColor: STYLE_CONSTANTS.PRIMARY_COLOR,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '10px 24px',
    backgroundColor: STYLE_CONSTANTS.SECONDARY_COLOR,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  uploadActions: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  spinner: {
    display: 'inline-block',
    width: '1em',
    height: '1em',
    verticalAlign: 'middle',
    borderRadius: '50%',
    border: '2px solid white',
    borderRightColor: 'transparent',
    animation: 'spin 1s linear infinite',
  },
  positionInfo: {
    marginTop: '10px',
    padding: '8px 12px',
    backgroundColor: '#e6f2ff',
    borderRadius: '4px',
    color: STYLE_CONSTANTS.PRIMARY_COLOR,
  },
};

interface ProfileResponse {
    id: string;
    profile: any;
    files: any[];
}

interface PositionItem {
    id: string;
    name: string;
}

const NewProfileCreateView = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [promptText, setPromptText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<PositionItem | null>(null);
    const [hasPositions, setHasPositions] = useState(true);

    const tp = (key: string) => String(t(`NewProfileCreateView.${key}`));

    const handleFilesSelected = (newFiles: File[]) => {
        setSelectedFiles((prev) => {
        const existing = new Set(prev.map(f => `${f.name}-${f.size}-${f.lastModified}`));
        const filtered = newFiles.filter(
            f => !existing.has(`${f.name}-${f.size}-${f.lastModified}`)
        );
        return [...prev, ...filtered];
        });
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    };
    
    const handlePositionSelect = (position: PositionItem | null) => {
        setSelectedPosition(position);
    };

    const handlePositionListState = (hasItems: boolean) => {
        setHasPositions(hasItems);
    };

    const sendFilesToServer = async () => {
        if (selectedFiles.length === 0) {
            alert(tp('errors.selectFileAlert'));
            return;
        }

        if (!selectedPosition) {
            alert(tp('errors.selectPositionAlert'));
            return;
        }

        setIsSending(true);

        const formData = new FormData();
        
        formData.append('prompt', promptText || tp('defaultPrompt'));
        
        formData.append('position_id', selectedPosition.id);
        
        selectedFiles.forEach((file) => {
          formData.append('files', file); 
        });

        try {
          const response = await fetch('/api/v1/ai/generate', { 
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.message || tp('errors.failedToCreateProfile')}`);
          }
          
          const data: ProfileResponse = await response.json();

          if (data.id) {
            const newPath = `${ROUTES.INFO}/profile/${data.id}`; 
            navigate(newPath);
          } else {
             alert(tp('errors.idMissingAlert'));
             setSelectedFiles([]);
          }

        } catch (error) {
          console.error('Помилка завантаження файлів:', error);
          
          const errorMessage = (error instanceof Error) 
                               ? error.message 
                               : tp('errors.unknownUploadError');
          
          alert(`${tp('errors.uploadErrorPrefix')}: ${errorMessage}`);
        } finally {
            setIsSending(false);
        }
    };

    const handleCreatePositionClick = () => {
        navigate(ROUTES.INFO + ROUTES.POSITION_CREATE);
    };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{tp('title')}</h2>

      <div style={styles.formGroup}>
          <label htmlFor="prompt-input" style={styles.label}>
              {tp('promptLabel')}
          </label>
          <textarea
              id="prompt-input"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              placeholder={tp('promptPlaceholder')}
              style={{ ...styles.textarea, ...(isSending ? styles.disabledButton : {}) }}
              disabled={isSending}
          />
      </div>

      <div style={styles.formGroup}>
          <PositionChoiseListView 
            onPositionSelect={handlePositionSelect}
            onListStateChange={handlePositionListState}
          />

          {!hasPositions && (
              <button 
                  onClick={handleCreatePositionClick} 
                  style={{ ...styles.secondaryButton, marginTop: '10px', padding: '8px 15px', backgroundColor: '#e6f2ff', color: STYLE_CONSTANTS.PRIMARY_COLOR }}
              >
                  {tp('createNewPositionButton')}
              </button>
          )}
          
          {selectedPosition && (
              <p style={styles.positionInfo}>
                  {tp('selectedPosition')}: **{selectedPosition.name}**
              </p>
          )}
      </div>

      <UploadFileButton
        onFilesSelected={handleFilesSelected}
        multiple
        accept="image/*,.pdf,.doc,.docx"
        className="upload-btn-primary" 
        disabled={isSending}
      >
        📎 {tp('uploadButtonText')}
      </UploadFileButton>

      <UploadedFileListView
        files={selectedFiles}
      />

      {selectedFiles.length > 0 && (
        <div style={styles.uploadActions}>
          <button 
            onClick={() => setSelectedFiles([])} 
            style={{ ...styles.secondaryButton, ...(isSending ? styles.disabledButton : {}) }}
            disabled={isSending}
          >
            {tp('clearAllButton')}
          </button>
          <button
            onClick={sendFilesToServer}
            disabled={isSending || !selectedPosition}
            style={{ 
              ...styles.primaryButton, 
              ...(isSending || !selectedPosition ? styles.disabledButton : {})
            }}
          >
            {isSending ? (
                <>
                    <span style={{ marginRight: '8px' }}>{tp('sending')}</span>
                    <span role="status" aria-hidden="true" style={styles.spinner} />
                </>
            ) : (
                tp('createProfileButton')
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewProfileCreateView;