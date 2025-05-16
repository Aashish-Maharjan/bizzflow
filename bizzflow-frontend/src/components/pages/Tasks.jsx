import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialData = {
  todo: [],
  inProgress: [],
  completed: [],
};

const columns = {
  todo: "To Do",
  inProgress: "In Progress",
  completed: "Completed",
};

export default function Tasks() {
  const [tasks, setTasks] = useState(initialData);
  const [form, setForm] = useState({
    name: "",
    content: "",
    image: null,
  });
  const [activeColumn, setActiveColumn] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: URL.createObjectURL(file) });
    }
  };

  const addTask = () => {
    const id = Date.now().toString();
    const newTask = { id, ...form };
    const updatedCol = [...tasks[activeColumn], newTask];
    setTasks({ ...tasks, [activeColumn]: updatedCol });
    setForm({ name: "", content: "", image: null });
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
                          <DialogTitle>Assign Task</DialogTitle>
                        </DialogHeader>
                        <Input
                          placeholder="Employee name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <Input
                          placeholder="Task description"
                          value={form.content}
                          onChange={(e) => setForm({ ...form, content: e.target.value })}
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
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
                            {task.image && (
                              <img
                                src={task.image}
                                alt="Profile"
                                className="w-full h-32 object-cover rounded mb-2"
                              />
                            )}
                            <div className="font-semibold">{task.name}</div>
                            <div className="text-sm">{task.content}</div>
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
