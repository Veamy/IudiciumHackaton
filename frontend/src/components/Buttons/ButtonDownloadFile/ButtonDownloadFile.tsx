import React, { type FC } from 'react';
import { useTranslation } from 'react-i18next';


interface ButtonDownloadFileProps {
    title: string; 
    sourceUrl?: string; 
    style?: React.CSSProperties; 
}

const ButtonDownloadFile: FC<ButtonDownloadFileProps> = ({ title, sourceUrl, style }) => {
    const { t } = useTranslation();

    const isDisabled = !sourceUrl;

    const className = `ButtonsC2 ${isDisabled ? 'disabled' : ''}`;

    if (isDisabled) {
        return (
            <button
                className={className}
                disabled={true}
                aria-label={t('ButtonDownloadFile.downloadDisabled')}
                style={style}
            >
                <span className="button-text">{title}</span>
                <span className="button-glare"></span>
            </button>
        );
    }

    return (
        <a
            href={sourceUrl}
            download={title.replace(/\s/g, '_')}
            className={className}
            aria-label={`${t('ButtonDownloadFile.downloadFile')} ${title}`}
            style={style}
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className="button-text">{title}</span>
            <span className="button-glare"></span>
        </a>
    );
};

export default ButtonDownloadFile;