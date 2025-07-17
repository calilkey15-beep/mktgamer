import { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '../lib/supabase';
import { toast } from 'react-toastify';

export const useClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure mock data is properly initialized
    const timer = setTimeout(() => {
      loadClients();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const addClient = async (clientData: any) => {
    try {
      console.log('Adding client with data:', clientData);
      const newClient = await createClient(clientData);
      console.log('Client created successfully:', newClient);
      setClients(prev => [newClient, ...prev]);
      toast.success('Cliente cadastrado com sucesso!');
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Erro ao cadastrar cliente');
      throw error;
    }
  };

  const editClient = async (id: string, updates: any) => {
    try {
      const updatedClient = await updateClient(id, updates);
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ));
      toast.success('Cliente atualizado com sucesso!');
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  };

  const removeClient = async (id: string) => {
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(client => client.id !== id));
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erro ao excluir cliente');
      throw error;
    }
  };

  return {
    clients,
    loading,
    addClient,
    updateClient: editClient,
    deleteClient: removeClient,
    refreshClients: loadClients,
  };
};