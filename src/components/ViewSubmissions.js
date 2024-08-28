import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const ViewSubmissions = () => {
  const { formId } = useParams();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const q = query(collection(db, "forms", formId, "submissions"));
      const querySnapshot = await getDocs(q);
      const fetchedSubmissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubmissions(fetchedSubmissions);
    };
    fetchSubmissions();
  }, [formId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Form Submissions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Submission ID</TableCell>
              <TableCell>Submitted At</TableCell>
              {/* Add more table headers based on your form fields */}
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.id}</TableCell>
                <TableCell>
                  {submission.submittedAt.toDate().toLocaleString()}
                </TableCell>
                {/* Add more table cells based on your form fields */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewSubmissions;
