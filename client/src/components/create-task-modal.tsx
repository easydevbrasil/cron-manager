import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCronTaskSchema, CronTask } from "@shared/schema";
import { z } from "zod";

const formSchema = insertCronTaskSchema.extend({
  name: z.string().min(1, "Nome é obrigatório"),
  command: z.string().min(1, "Comando é obrigatório"),
  cronExpression: z.string().min(1, "Expressão cron é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: CronTask | null;
}

export function CreateTaskModal({ isOpen, onClose, editingTask }: CreateTaskModalProps) {
  const [cronExpression, setCronExpression] = useState("0 2 * * *");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingTask?.name || "",
      description: editingTask?.description || "",
      command: editingTask?.command || "",
      cronExpression: editingTask?.cronExpression || "0 2 * * *",
      timeout: editingTask?.timeout || 300,
      status: editingTask?.status || "active",
      enableWebhook: editingTask?.enableWebhook || false,
      enableEmailNotification: editingTask?.enableEmailNotification || false,
      emailOnSuccess: editingTask?.emailOnSuccess || false,
      emailOnFailure: editingTask?.emailOnFailure || true,
      logOutput: editingTask?.logOutput || true,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: FormData) => 
      editingTask 
        ? apiRequest("PUT", `/api/tasks/${editingTask.id}`, data)
        : apiRequest("POST", "/api/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: editingTask ? "Tarefa atualizada" : "Tarefa criada",
        description: editingTask 
          ? "A tarefa foi atualizada com sucesso." 
          : "A nova tarefa foi adicionada e está ativa.",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar a tarefa.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createTaskMutation.mutate(data);
  };

  const updateCronExpression = () => {
    const minute = (document.querySelector('[data-cron="minute"]') as HTMLSelectElement)?.value || "*";
    const hour = (document.querySelector('[data-cron="hour"]') as HTMLSelectElement)?.value || "*";
    const day = (document.querySelector('[data-cron="day"]') as HTMLSelectElement)?.value || "*";
    const month = (document.querySelector('[data-cron="month"]') as HTMLSelectElement)?.value || "*";
    const dayOfWeek = (document.querySelector('[data-cron="dayOfWeek"]') as HTMLSelectElement)?.value || "*";
    
    const newExpression = `${minute} ${hour} ${day} ${month} ${dayOfWeek}`;
    setCronExpression(newExpression);
    form.setValue("cronExpression", newExpression);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingTask ? "Editar Tarefa Cron" : "Criar Nova Tarefa Cron"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <i className="fas fa-times text-xl"></i>
          </Button>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Tarefa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Backup do banco de dados" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o que esta tarefa faz..." 
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="command"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comando/Script</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: /usr/bin/backup.sh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="cronExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expressão Cron</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 0 2 * * *" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="md:col-span-2">
              <FormLabel>Gerador de Expressão Cron</FormLabel>
              <div className="grid grid-cols-5 gap-4 mt-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minuto</label>
                  <select 
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded" 
                    data-cron="minute"
                    onChange={updateCronExpression}
                  >
                    <option value="*">*</option>
                    <option value="0">0</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Hora</label>
                  <select 
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded" 
                    data-cron="hour"
                    onChange={updateCronExpression}
                  >
                    <option value="*">*</option>
                    <option value="0">0</option>
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="18">18</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Dia</label>
                  <select 
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded" 
                    data-cron="day"
                    onChange={updateCronExpression}
                  >
                    <option value="*">*</option>
                    <option value="1">1</option>
                    <option value="15">15</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mês</label>
                  <select 
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded" 
                    data-cron="month"
                    onChange={updateCronExpression}
                  >
                    <option value="*">*</option>
                    <option value="1">Jan</option>
                    <option value="6">Jun</option>
                    <option value="12">Dez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Dia Semana</label>
                  <select 
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded" 
                    data-cron="dayOfWeek"
                    onChange={updateCronExpression}
                  >
                    <option value="*">*</option>
                    <option value="0">Dom</option>
                    <option value="1">Seg</option>
                    <option value="5">Sex</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout (segundos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="300" 
                        {...field}
                        value={field.value || 300}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 300)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Inicial</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enableWebhook"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enviar webhook</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="logOutput"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Salvar logs</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableEmailNotification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Notificações por email</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name="emailOnSuccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Sucesso</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emailOnFailure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Falha</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createTaskMutation.isPending 
                ? "Processando..." 
                : editingTask 
                  ? "Atualizar Tarefa" 
                  : "Criar Tarefa"
              }
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
