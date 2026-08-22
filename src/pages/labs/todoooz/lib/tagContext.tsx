import React, { createContext, useContext, useMemo } from 'react';
import type { TdzTag } from './types';

export const DEFAULT_TAG_COLOR = '#6366f1';

export const TAG_COLOR_OPTIONS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#a855f7',
  '#64748b',
];

interface TagLibrary {
  tags: TdzTag[];
  colorFor: (name: string) => string;
  createTag: (name: string, color?: string) => Promise<TdzTag | null>;
  updateTag: (id: string, patch: Partial<TdzTag>) => void | Promise<void>;
  deleteTag: (id: string) => void | Promise<void>;
}

const noop = async () => null;

const TagContext = createContext<TagLibrary>({
  tags: [],
  colorFor: () => DEFAULT_TAG_COLOR,
  createTag: noop,
  updateTag: () => {},
  deleteTag: () => {},
});

export const TagProvider: React.FC<{
  tags: TdzTag[];
  createTag: TagLibrary['createTag'];
  updateTag: TagLibrary['updateTag'];
  deleteTag: TagLibrary['deleteTag'];
  children: React.ReactNode;
}> = ({ tags, createTag, updateTag, deleteTag, children }) => {
  const value = useMemo<TagLibrary>(() => {
    const map = new Map(tags.map((t) => [t.name.toLowerCase(), t.color]));
    return {
      tags,
      colorFor: (name: string) => map.get(name.trim().toLowerCase()) ?? DEFAULT_TAG_COLOR,
      createTag,
      updateTag,
      deleteTag,
    };
  }, [tags, createTag, updateTag, deleteTag]);

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};

export const useTagLibrary = () => useContext(TagContext);
