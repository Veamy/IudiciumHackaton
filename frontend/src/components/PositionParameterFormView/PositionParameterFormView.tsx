// src/components/PositionParameterFormView/PositionParameterFormView.tsx
import { type PositionParameter } from '../../types/PositionParameter';
import { useTranslation } from 'react-i18next';
import React from 'react'; 

interface PositionParameterFormViewProps {
  parameter: PositionParameter;
  onChange: (parameter: PositionParameter) => void;
  onRemove: () => void;
  index: number;
}


const PositionParameterFormView: React.FC<PositionParameterFormViewProps> = ({
  parameter, 
  onChange,
  onRemove,
  index,
}) => {
  const { t } = useTranslation();

  const tp = (key: string) => t(`PositionParameterFormView.parameterForm.${key}`);

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#fafafa',
      }}
    >

      <h4>{tp('title')} {index}</h4> 

      <div style={{ marginBottom: 12 }}>
        <label>
          {tp('parameterTitle')} <br />
          <input
            type="text"

            value={parameter.title}
            onChange={(e) =>
              onChange({ ...parameter, title: e.target.value })
            }
            placeholder={tp('parameterTitlePlaceholder')}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          {tp('description')} <br />
          <textarea
            value={parameter.description}
            onChange={(e) =>
              onChange({ ...parameter, description: e.target.value })
            }
            rows={3}
            placeholder={tp('descriptionPlaceholder')}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box', resize: 'vertical' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>
          {tp('points')} <br />
          <input
            type="number"
            min="0"
            step="1"
            value={parameter.point}
            onChange={(e) =>

              onChange({
                ...parameter,
                point: e.target.value === '' ? 0 : Number(e.target.value),
              })
            }
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          color: '#d32f2f',
          cursor: 'pointer',
          fontSize: '14px',
          padding: 0,
        }}
      >
        {tp('removeButton')}
      </button>
    </div>
  );
};

export default PositionParameterFormView;