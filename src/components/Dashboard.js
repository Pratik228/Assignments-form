import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
} from "@mui/material";

const Dashboard = () => {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    const fetchForms = async () => {
      const querySnapshot = await getDocs(collection(db, "forms"));
      const fetchedForms = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setForms(fetchedForms);
    };
    fetchForms();
  }, []);

  const addNewForm = async () => {
    const newForm = {
      title: "New Feedback Form",
      fields: [],
      createdAt: Timestamp.now(),
      viewCount: 0,
      submissionCount: 0,
      isPublished: false,
    };
    const docRef = await addDoc(collection(db, "forms"), newForm);
    setForms([...forms, { id: docRef.id, ...newForm }]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Feedback Forms Dashboard
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={addNewForm}
        sx={{ mb: 3 }}
      >
        Add New Form
      </Button>
      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} sm={6} md={4} key={form.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {form.title}
                </Typography>
                <Typography color="text.secondary">
                  Created: {form.createdAt.toDate().toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Views: {form.viewCount} | Submissions: {form.submissionCount}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={Link}
                  to={`/edit-form/${form.id}`}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  component={Link}
                  to={`/view-submissions/${form.id}`}
                >
                  View Submissions
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
