
import { firebaseConfig } from '../firebaseConfig';
import { UserRole } from '../types';

// Declaração para o compilador TypeScript saber que 'firebase' existe no escopo global
declare const firebase: any;

// --- Inicialização do Firebase ---
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// --- Funções Genéricas ---

/**
 * Escuta mudanças em uma coleção em tempo real.
 * @param collectionName O nome da coleção.
 * @param callback A função a ser chamada com os novos dados.
 * @returns A função para parar de escutar (unsubscribe).
 */
export const onCollectionUpdate = <T>(collectionName: string, callback: (data: T[]) => void): (() => void) => {
  return db.collection(collectionName).onSnapshot((querySnapshot: any) => {
    const data: T[] = [];
    querySnapshot.forEach((doc: any) => {
      data.push({ id: doc.id, ...doc.data() } as unknown as T);
    });
    callback(data);
  });
};

/**
 * Atualiza um documento em uma coleção.
 * @param collectionName O nome da coleção.
 * @param docId O ID do documento.
 * @param data O objeto com os campos a serem atualizados.
 */
export const updateDocument = async (collectionName: string, docId: string, data: object): Promise<void> => {
  const docRef = db.collection(collectionName).doc(docId);
  await docRef.update(data);
};

/**
 * Adiciona um novo documento a uma coleção.
 * @param collectionName O nome da coleção.
 * @param data O objeto com os dados do novo documento.
 * @returns O documento adicionado com seu ID.
 */
export const addDocument = async <T>(collectionName: string, data: T): Promise<T & { id: string }> => {
    const docRef = await db.collection(collectionName).add(data);
    return { id: docRef.id, ...data };
};

/**
 * Remove um documento de uma coleção.
 * @param collectionName O nome da coleção.
 * @param docId O ID do documento a ser removido.
 */
export const removeDocument = async (collectionName: string, docId: string): Promise<void> => {
    await db.collection(collectionName).doc(docId).delete();
};

/**
 * Adiciona ou substitui um documento em uma coleção com um ID específico.
 * @param collectionName O nome da coleção.
 * @param docId O ID do documento.
 * @param data O objeto com os dados do documento.
 */
export const setDocument = async (collectionName: string, docId: string, data: object): Promise<void> => {
  await db.collection(collectionName).doc(docId).set(data);
};


// --- Funções Específicas (Exemplos) ---

// Para o login, precisamos buscar todos os usuários de uma vez
export const getAllUsers = async () => {
    const querySnapshot = await db.collection('users').get();
    const users: any[] = [];
    querySnapshot.forEach((doc: any) => {
        users.push({ id: doc.id, ...doc.data() });
    });
    return users;
}
