'use client';

import { useState, useCallback } from 'react';

interface DialogConfig {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => Promise<void>;
}

const EMPTY: DialogConfig = {
  title: '',
  description: '',
  onConfirm: async () => {},
};

export function useConfirmDialog() {
  const [config, setConfig] = useState<DialogConfig>(EMPTY);
  const [open, setOpen] = useState(false);

  const openDialog = useCallback((cfg: DialogConfig) => {
    setConfig(cfg);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    dialogProps: { open, ...config, onClose: closeDialog },
    openDialog,
  };
}
