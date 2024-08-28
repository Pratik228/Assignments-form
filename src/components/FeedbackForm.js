import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Rating,
  IconButton,
  Typography,
  Paper,
  Grid,
  Switch,
} from "@mui/material";
import {
  Edit,
  Delete,
  ArrowBack,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const fieldTypes = [
  { name: "Textarea", icon: "📝" },
  { name: "Numeric rating", icon: "🔢" },
  { name: "Star rating", icon: "⭐" },
  { name: "Smiley rating", icon: "😊" },
  { name: "Single line input", icon: "📄" },
  { name: "Radio button", icon: "🔘" },
  { name: "Categories", icon: "📊" },
];

const customIcons = {
  1: <SentimentVeryDissatisfied />,
  2: <SentimentDissatisfied />,
  3: <SentimentNeutral />,
  4: <SentimentSatisfied />,
  5: <SentimentVerySatisfied />,
};

const FeedbackForm = () => {
  const { formId } = useParams();
  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [formTitle, setFormTitle] = useState("Generic Website Rating");
  const [showUrlCondition, setShowUrlCondition] = useState(false);
  const [showDateCondition, setShowDateCondition] = useState(false);
  const [showTimeCondition, setShowTimeCondition] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      if (formId) {
        const docRef = doc(db, "forms", formId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const formData = docSnap.data();
          setFields(formData.fields || []);
          setFormTitle(formData.title || "Generic Website Rating");
          setIsPublished(formData.isPublished || false);
          // Increment view count
          await updateDoc(docRef, {
            viewCount: increment(1),
          });
        }
      }
    };
    fetchForm();
  }, [formId]);

  const submitForm = async (formData) => {
    if (formId) {
      const submissionData = {
        ...formData,
        submittedAt: Timestamp.now(),
      };
      await addDoc(
        collection(db, "forms", formId, "submissions"),
        submissionData
      );
      await updateDoc(doc(db, "forms", formId), {
        submissionCount: increment(1),
      });
      // Set a flag in localStorage to prevent showing the form again
      localStorage.setItem(`form_${formId}_submitted`, "true");
    }
  };

  const saveForm = async () => {
    const formData = {
      title: formTitle,
      fields,
      isPublished,
      updatedAt: Timestamp.now(),
    };
    if (formId) {
      await setDoc(doc(db, "forms", formId), formData, { merge: true });
    } else {
      const docRef = await addDoc(collection(db, "forms"), formData);
      // You might want to update your component state or redirect to the edit page here
    }
  };

  const publishForm = async () => {
    setIsPublished(true);
    if (formId) {
      await updateDoc(doc(db, "forms", formId), {
        isPublished: true,
      });
    }
  };

  const addField = (type) => {
    if (fields.length < 7) {
      setFields([
        ...fields,
        {
          id: `field-${Date.now()}`,
          type,
          label: `New ${type}`,
          required: false,
          errorMessage: "",
          options:
            type === "Radio button" || type === "Categories"
              ? ["Option 1"]
              : undefined,
        },
      ]);
    }
  };

  const updateField = (id, updates) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const deleteField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newFields = Array.from(fields);
    const [reorderedItem] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, reorderedItem);
    setFields(newFields);
  };

  const renderField = (field) => {
    switch (field.type) {
      case "Star rating":
        return <Rating name={field.id} />;
      case "Smiley rating":
        return (
          <Rating
            name={field.id}
            getLabelText={(value) => customIcons[value].props.children}
            IconContainerComponent={({ value, ...props }) => (
              <span {...props}>{customIcons[value]}</span>
            )}
          />
        );
      case "Textarea":
        return <TextField multiline rows={4} fullWidth />;
      case "Radio button":
        return (
          <RadioGroup>
            {field.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        );
      case "Categories":
        return (
          <Box>
            {field.options.map((option, index) => (
              <Button key={index} variant="outlined" sx={{ mr: 1, mb: 1 }}>
                {option}
              </Button>
            ))}
          </Box>
        );
      case "Numeric rating":
        return (
          <Box display="flex" justifyContent="space-between">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <Button key={num} variant="outlined">
                {num}
              </Button>
            ))}
          </Box>
        );
      case "Single line input":
        return <TextField fullWidth />;
      default:
        return null;
    }
  };

  const renderFieldEdit = (field) => (
    <Box>
      <TextField
        label="Field Label"
        value={field.label}
        onChange={(e) => updateField(field.id, { label: e.target.value })}
        fullWidth
        margin="normal"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={field.required}
            onChange={(e) =>
              updateField(field.id, { required: e.target.checked })
            }
          />
        }
        label="Required"
      />
      {field.required && (
        <TextField
          label="Error Message"
          value={field.errorMessage}
          onChange={(e) =>
            updateField(field.id, { errorMessage: e.target.value })
          }
          fullWidth
          margin="normal"
        />
      )}
      {(field.type === "Radio button" || field.type === "Categories") && (
        <Box>
          {field.options.map((option, index) => (
            <Box key={index} display="flex" alignItems="center" mb={1}>
              <TextField
                value={option}
                onChange={(e) => {
                  const newOptions = [...field.options];
                  newOptions[index] = e.target.value;
                  updateField(field.id, { options: newOptions });
                }}
                fullWidth
              />
              <IconButton
                onClick={() => {
                  const newOptions = field.options.filter(
                    (_, i) => i !== index
                  );
                  updateField(field.id, { options: newOptions });
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            onClick={() =>
              updateField(field.id, {
                options: [
                  ...field.options,
                  `Option ${field.options.length + 1}`,
                ],
              })
            }
          >
            Add Option
          </Button>
        </Box>
      )}
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditingField(null)}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          onClick={() => setEditingField(null)}
          sx={{ ml: 1 }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        USER FEEDBACK
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ArrowBack sx={{ mr: 1 }} />
              <TextField
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                variant="standard"
                fullWidth
              />
              <IconButton>
                <Edit />
              </IconButton>
            </Box>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {fields.map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={1}
                            sx={{ p: 2, mb: 2 }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Typography>{field.label}</Typography>
                              <Box>
                                <IconButton
                                  onClick={() => setEditingField(field.id)}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  onClick={() => deleteField(field.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Box>
                            {editingField === field.id
                              ? renderFieldEdit(field)
                              : renderField(field)}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add fields
            </Typography>
            {fieldTypes.map((type) => (
              <Button
                key={type.name}
                onClick={() => addField(type.name)}
                disabled={fields.length >= 7}
                fullWidth
                sx={{ justifyContent: "flex-start", mb: 1 }}
              >
                {type.icon} {type.name}
              </Button>
            ))}
          </Paper>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Logic
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showUrlCondition}
                  onChange={(e) => setShowUrlCondition(e.target.checked)}
                />
              }
              label="Show based on URL conditions"
            />
            {showUrlCondition && (
              <TextField fullWidth placeholder="http://" sx={{ mt: 1 }} />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={showDateCondition}
                  onChange={(e) => setShowDateCondition(e.target.checked)}
                />
              }
              label="Show on a specific date"
            />
            {showDateCondition && (
              <TextField fullWidth placeholder="MM/DD/YYYY" sx={{ mt: 1 }} />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={showTimeCondition}
                  onChange={(e) => setShowTimeCondition(e.target.checked)}
                />
              }
              label="Show on a specific time"
            />
            {showTimeCondition && (
              <TextField fullWidth placeholder="hh:mm aa" sx={{ mt: 1 }} />
            )}
          </Paper>
        </Grid>
      </Grid>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={saveForm}
          sx={{ mr: 1 }}
        >
          SAVE
        </Button>
        {!isPublished && (
          <Button variant="contained" color="success" onClick={publishForm}>
            PUBLISH
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FeedbackForm;
