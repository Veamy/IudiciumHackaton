import { type FC } from 'react';

/**
 * @interface SectionHeaderProps
 * @description Властивості, які приймає компонент SectionHeader.
 */
interface SectionHeaderProps {
  /** Заголовок, який буде відображатися в секції */
  title: string;
}

/**
 * @component SectionHeader
 * @description Компонент для стандартизованого відображення заголовків секцій профілю.
 * Використовує стилі, які ви визначили у батьківському компоненті (синя лінія знизу).
 */
const SectionHeader: FC<SectionHeaderProps> = ({ title }) => (
  <h3 
    style={{ 
      borderBottom: '2px solid #007bff', 
      paddingBottom: '5px', 
      marginTop: '30px', 
      color: '#007bff' 
    }}
  >
    {title}
  </h3>
);

export default SectionHeader;