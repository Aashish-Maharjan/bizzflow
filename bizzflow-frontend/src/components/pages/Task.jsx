import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Plus } from "lucide-react";
  import { useState } from "react";
  import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
  
  const initialData = {
    todo: [{ id: "1", content: "Create tax report" }],
    inProgress: [{ id: "2", content: "Approve payroll slips" }],
    completed: [{ id: "3", content: "Vendor payment processing" }],
  };
  
  const columns = {
    todo: "To Do",
    inProgress: "In Progress",
    completed: "Completed",
  };
  
  export default function Tasks() {
    const [tasks, setTasks] = useState(initialData);
    const [newTask, setNewTask] = useState("");
    const [activeColumn, setActiveColumn] = useState(null);
  
    const addTask = () => {
      const id = Date.now().toString();
      const updatedCol = [...tasks[activeColumn], { id, content: newTask }];
      setTasks({ ...tasks, [activeColumn]: updatedCol });
      setNewTask("");
    };
  
    const onDragEnd = (result) => {
      const { source, destination } = result;
      if (!destination) return;
  
      const sourceCol = [...tasks[source.droppableId]];
      const destCol = [...tasks[destination.droppableId]];
      const [movedTask] = sourceCol.splice(source.index, 1);
  
      if (source.droppableId === destination.droppableId) {
        sourceCol.splice(destination.index, 0, movedTask);
        setTasks({ ...tasks, [source.droppableId]: sourceCol });
      } else {
        destCol.splice(destination.index, 0, movedTask);
        setTasks({
          ...tasks,
          [source.droppableId]: sourceCol,
          [destination.droppableId]: destCol,
        });
      }
    };
  
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Task Board</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Object.entries(columns).map(([colId, colName]) => (
              <Droppable key={colId} droppableId={colId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow min-h-[300px]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{colName}</h3>
  
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => setActiveColumn(colId)}
                          >
                            <Plus size={18} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                          </DialogHeader>
                          <Input
                            placeholder="Task title..."
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                          />
                          <Button onClick={addTask} className="mt-2 w-full">
                            Add
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
  
                    <div className="space-y-3">
                      {tasks[colId].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-md shadow cursor-grab"
                            >
                              {task.content}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    );
  }
  