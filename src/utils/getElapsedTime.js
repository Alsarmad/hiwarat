import translationManager from "./translationManager.js";


export default function getElapsedTime(updatedAt, showOnly = true, lang = "en") {
  const now = new Date();
  const timeDifference = now - new Date(updatedAt);

  const minutes = Math.floor(timeDifference / (1000 * 60));
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));

  if (showOnly) {
    if (minutes < 60) {
      return translationManager.translate('elapsed_time_minutes', { minutes }, lang);
    } else if (hours < 24) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return translationManager.translate('elapsed_time_hours_only', { hours }, lang);
      } else {
        return translationManager.translate('elapsed_time_hours_minutes', { hours, remainingMinutes }, lang);
      }
    } else if (days < 30) {
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return translationManager.translate('elapsed_time_days_only', { days }, lang);
      } else {
        return translationManager.translate('elapsed_time_days_hours', { days, remainingHours }, lang);
      }
    } else if (months < 12) {
      const remainingDays = days % 30;
      if (remainingDays === 0) {
        return translationManager.translate('elapsed_time_months_only', { months }, lang);
      } else {
        return translationManager.translate('elapsed_time_months_days', { months, remainingDays }, lang);
      }
    } else {
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return translationManager.translate('elapsed_time_years_only', { years }, lang);
      } else {
        return translationManager.translate('elapsed_time_years_months', { years, remainingMonths }, lang);
      }
    }
  } else {
    if (minutes < 60) {
      return translationManager.translate('elapsed_time_minutes', { minutes }, lang);
    } else if (hours < 24) {
      return translationManager.translate('elapsed_time_hours_only', { hours }, lang);
    } else if (days < 30) {
      return translationManager.translate('elapsed_time_days_only', { days }, lang);
    } else if (months < 12) {
      return translationManager.translate('elapsed_time_months_only', { months }, lang);
    } else {
      return translationManager.translate('elapsed_time_years_only', { years }, lang);
    }
  }
}