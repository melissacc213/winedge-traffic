import { ActionIcon, Menu } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icons } from '../icons';

export default function LanguageMenu() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const languages = [
    {
      code: 'en',
      label: 'English',
    },
    {
      code: 'zh-TW',
      label: '繁體中文',
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