import type { ReactNode } from 'react';
import { useRoles } from '@/hooks/use-role';
export function TelaPermitida({tela,children}:{tela:string;children:ReactNode}) {const {podeTela,loading}=useRoles();return !loading&&podeTela(tela)?<>{children}</>:null;}
