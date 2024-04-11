import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoteFormEdit from "../components/LoteFormEdit";
import CropFormEdit from "../components/CropFormEdit";

export default function EditCrop() {
  const { id } = useParams();
  const cropId = id;

  return (
    <div>
      <CropFormEdit cropId={cropId} />
    </div>
  );
}
