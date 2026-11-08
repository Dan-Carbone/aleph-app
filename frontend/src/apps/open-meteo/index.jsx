import React from 'react';
import OpenMeteoApp from './App';

// Application descriptor exported as default
export default {
  id: 'open-meteo',
  title: 'Open Meteo',
  path: '/apps/open-meteo',
  icon: 'CloudSun', // Icon identifier or component
  order: 10,
  component: OpenMeteoApp,
};