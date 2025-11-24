import { useState } from "react";
import ItemList from "../../../components/ItemList/ItemList";
import ROUTES from "../../../ROUTES";
import ButtonC1 from "../../../components/Buttons/ButtonC1/ButtonC1";
import './LeftBarStyle.css'
import '../../../env'
import API_URL from "../../../env";
import { useTranslation } from 'react-i18next'; 

const LeftBar = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'profile' | 'position'>('profile');

    return (
        <div className="chat-list-container">
            <div className="switcher-header">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`switcher-btn ${activeTab === 'profile' ? 'active' : ''}`}
                >
                    {t('LeftBar.profilesTab')}
                </button>

                <button
                    onClick={() => setActiveTab('position')}
                    className={`switcher-btn ${activeTab === 'position' ? 'active' : ''}`}
                >
                    {t('LeftBar.positionsTab')}
                </button>
            </div>

            <div className="button-create-new-item">
                <ButtonC1 
                    text={
                        activeTab === 'profile' 
                            ? t('LeftBar.createNewProfileButton') 
                            : t('LeftBar.createNewPositionButton')
                    }
                    to={
                        activeTab === 'profile'
                            ? `${ROUTES.INFO}/profile/create`
                            : `${ROUTES.INFO}/position/create`
                    }
                />
            </div>

            {activeTab === 'profile' && <ItemList sourceUrl={`${API_URL.BACK_END_URL}${API_URL.GET_LIST_PROFILE}`}  typeLink="profile" />}
            {activeTab === 'position' && <ItemList sourceUrl={`${API_URL.BACK_END_URL}${API_URL.GET_LIST_POSITION}`} typeLink="position" />}
        </div>
    );
}

export default LeftBar;