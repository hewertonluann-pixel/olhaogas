import { db } from '../firebaseConfig';
import { UserRole } from '../types';
import { 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc, 
    addDoc, 
    deleteDoc, 
    setDoc, 
    getDocs,
    query
} from "firebase/firestore";

// --- Funções Genéricas ---

/**
 * Escuta mudanças em uma coleção em tempo real.
 * @param collectionName O nome da coleção.
 * @param callback A função a ser chamada com os novos dados.
 * @returns A função para parar de escutar (unsubscribe).
 */
export const onCollectionUpdate = <T>(collectionName: string, callback: (data: T[]) => void): (() => void) => {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, (querySnapshot) => {
    const data: T[] = [];
    querySnapshot.forEach((document) => {
      data.push({ id: document.id, ...document.data() } as unknown as T);
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
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
};

/**
 * Adiciona um novo documento a uma coleção.
 * @param collectionName O nome da coleção.
 * @param data O objeto com os dados do novo documento.
 * @returns O documento adicionado com seu ID.
 */
export const addDocument = async <T>(collectionName: string, data: T): Promise<T & { id: string }> => {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, data);
    return { id: docRef.id, ...data };
};

/**
 * Remove um documento de uma coleção.
 * @param collectionName O nome da coleção.
 * @param docId O ID do documento a ser removido.
 */
export const removeDocument = async (collectionName: string, docId: string): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
};

/**
 * Adiciona ou substitui um documento em uma coleção com um ID específico.
 * @param collectionName O nome da coleção.
 * @param docId O ID do documento.
 * @param data O objeto com os dados do documento.
 */
export const setDocument = async (collectionName: string, docId: string, data: object): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data);
};


// --- Funções Específicas (Exemplos) ---

// Para o login, precisamos buscar todos os usuários de uma vez
export const getAllUsers = async () => {
    const colRef = collection(db, 'users');
    const q = query(colRef);
    const querySnapshot = await getDocs(q);
    const users: any[] = [];
    querySnapshot.forEach((document) => {
        users.push({ id: document.id, ...document.data() });
    });
    return users;
}
