import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { RootState } from './store/root';
import type { AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
