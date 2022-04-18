import { fireToast } from './fire-toast.function';

type FunctionType = <T extends { name: string }>(
  payload: T,
  entityName: string,
  participle:
    | 'atualizado'
    | 'criado'
    | 'deletado'
    | 'criada'
    | 'atualizada'
    | 'deletada',
  err?: any
) => void;

export const fireError: FunctionType = (
  payload,
  entityName: string,
  participle:
    | 'atualizado'
    | 'criado'
    | 'deletado'
    | 'criada'
    | 'atualizada'
    | 'deletada',
  err?: any
) => {
  fireToast(
    'Erro 😞',
    `${entityName} ${payload.name} não pôde ser ${participle}.`,
    'error'
  );
};
