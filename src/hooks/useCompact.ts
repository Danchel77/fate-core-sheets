import { useEffect, useState } from 'react';

/** Узкий экран: блоки листа и подсказки перестраиваются под одну колонку. */
const QUERY = '(max-width: 720px)';

export function useCompact(): boolean {
  const [compact, setCompact] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = () => setCompact(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return compact;
}
