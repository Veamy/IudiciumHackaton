import api from '../../client/client';
import React from 'react';
import './ItemListStyle.css';
import { useTranslation } from 'react-i18next';
import ButtonC1 from '../Buttons/ButtonC1/ButtonC1';
import ItemLink from '../ItemLink/ItemLink';
import { ROUTES } from '../../ROUTES';

interface ItemList {
  id: string;
  name: string;
  typeLink?: string;
}

interface ItemListProps {
  sourceUrl?: string;
  sourceList?: ItemList[];
  typeLink?: string;
}

const ItemList: React.FC<ItemListProps> = ({ sourceUrl, sourceList, typeLink }) => {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<ItemList[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);

  

  React.useEffect(() => {
    if (sourceUrl) {
      setLoading(true);
      setError(false);

      fetch(sourceUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to fetch items`);
          }
          return res.json();
        })
        .then((data: ItemList[] | { items: ItemList[] }) => {
          // Support both direct array and { items: [...] } wrapper
          const list = Array.isArray(data) ? data : data.items || [];
          setItems(list);
          setLoading(false);
        })
        .catch((err) => {
          console.error('ItemList fetch error:', err);
          setError(true);
          setLoading(false);
        });
    } else if (sourceList) {
      setItems(sourceList);
      setLoading(false);
      setError(false);
    } else {
      setItems([]);
      setLoading(false);
      setError(false);
    }
  }, [sourceUrl, sourceList]); 
  if (loading) {
    return (
      <div className="items-list-container">
        <div className="items-list">
          {[...Array(5)].map((_, i) => (
            <li key={i} className="items-item skeleton">
              <div className="skeleton-avatar" />
              <div className="skeleton-line short" />
            </li>
          ))}
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="items-list-container">
        <div className="alert alert-danger">
          {t('ChatList.loading-error') || t('common.error-loading')}
        </div>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="items-list-container">
        <div className="empty-state">
          <div className="empty-icon" />
          <p>{t('ProfileComponent.no-profile')}</p>
        </div>
      </div>
    );
  }

  // Main List
  return (
    <div className="items-list-container">
      <ul className="items-list">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="items-item"
            style={{ '--delay': `${index * 0.05}s` } as React.CSSProperties}
          >
            <ItemLink
              item={item}
              link={`${ROUTES.INFO}${typeLink ? `/${typeLink}` : ''}/${item.id}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemList;