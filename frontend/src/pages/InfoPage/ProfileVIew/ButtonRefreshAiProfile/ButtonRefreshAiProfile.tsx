import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ButtonRefreshAiProfile.module.css";
import { API_ENDPOINTS } from "../../../../env";

// Очікуваний тип відповіді від API
interface RefreshResponse {
    id: string;
    profile: { [key: string]: any };
    position_id?: string;
    files: any[];
    error_files?: any[];
}

interface ButtonRefreshAiProfileProps {
    candidateId: string;
    onRefreshSuccess: (data: RefreshResponse) => void;
    onRefreshError: (message: string) => void;
    prompt?: string;
    websearch?: boolean;
    disabled?: boolean;
}

const ButtonRefreshAiProfile: React.FC<ButtonRefreshAiProfileProps> = ({
    candidateId,
    onRefreshSuccess,
    onRefreshError,
    prompt = "refresh candidate profile",
    websearch = false,
    disabled = false,
}) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsLoading(true);
        const endpoint = API_ENDPOINTS.AI.REFRESH(candidateId);
        
        // Додаємо параметр websearch до URL, якщо він true
        const url = websearch ? `${endpoint}?websearch=true` : endpoint;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorBody = await response.json();
                const errorMessage = 
                    (errorBody.detail && Array.isArray(errorBody.detail) && errorBody.detail.length > 0)
                    ? errorBody.detail.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join('; ')
                    : t('common.errors.failedToRefresh');
                
                throw new Error(`HTTP ${response.status}: ${errorMessage}`);
            }

            const data: RefreshResponse = await response.json();
            onRefreshSuccess(data);

        } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : t('common.errors.unknownError');
            onRefreshError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [candidateId, prompt, websearch, onRefreshSuccess, onRefreshError, t]);

    const buttonText = isLoading ? t("common.refreshing") : t("common.refresh");

    return (
        <button
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={isLoading || disabled}
            title={t("common.refreshProfileTooltip")}
        >
            {buttonText}
            {isLoading && (
                <span className={styles.spinner} />
            )}
        </button>
    );
};

export default ButtonRefreshAiProfile;