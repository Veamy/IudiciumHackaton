import React from 'react';
import './ItemLinkStyle.css';
import { NavLink } from 'react-router-dom';

interface ItemLinkProps {
  item: {
    id: string;
    name: string;
  };
  link: string;
}

const ItemLink: React.FC<ItemLinkProps> = ({ item, link }) => {

    return (
         <NavLink to={link} className="item-link">
            <div className="item-info">
              <h3 className="item-title">{item.name || ''}</h3>
              <span className="item-id">ID: {item.id.slice(0, 8)}...</span>
            </div>
        </NavLink>
    );
};

export default ItemLink;