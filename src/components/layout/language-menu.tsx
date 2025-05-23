import { Icons } from '../icons';
import { ActionIcon, Menu } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageMenu() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const languages = [
    {
      label: 'English',
      code: 'en',
    },
    {
      label: '繁體中文',
      code: 'zh-TW',
    },
  ];

  return (
    <Menu position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="light" size="lg" aria-label="Change language">
          <Icons.Language className="h-5 w-5" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {languages.map((lang) => (
          <Menu.Item
            key={lang.code}
            onClick={() => {
              i18n.changeLanguage(lang.code);
            }}
            fw={currentLang === lang.code ? 'bold' : 'normal'}
          >
            {lang.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}