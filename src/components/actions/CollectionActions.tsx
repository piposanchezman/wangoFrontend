import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ApiContext } from "../../context/ApiContext";
import { Dropdown } from "../Dropdown";
import { CollectionFormEdit } from "../forms/CollectionFormEdit";
import { MoreOptions } from "../../icons/MoreOptions";
import { AddIcon } from "../../icons/Add";
import { DeleteIcon } from "../../icons/Delete";
import { EditIcon } from "../../icons/Edit";
import { Modal } from "../modals/Modal";
import { Collection } from "../../interfaces/collection";
import { updateCollectionStatus } from "../../services/collection_s";
import { Item } from "../../styles/components/Actions";

interface Props {
  collectionDetails: Collection;
  refetchCollections: React.Dispatch<React.SetStateAction<number>>;
}

export const CollectionActions: React.FC<Props> = ({ collectionDetails, refetchCollections }) => {
  const { backendApiCall } = useContext(ApiContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const actions = [
    {
      action: () => setIsEditModalOpen(true),
      icon: <EditIcon />,
      name: "Editar recoleción",
    },
    {
      action: () => handleUpdateCollectionStatus(collectionDetails._id, collectionDetails.crop_id),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      name: collectionDetails.status === "in_progress" ? "Detener recolección" : "Reanudar",
    },
    {
      action: () => navigate(`/dashboard/collections/records/${collectionDetails._id}`),
      icon: <AddIcon />,
      name: "Ver registros",
    },
  ];

  const handleUpdateCollectionStatus = async (collectionId: string, crop_id: string) => {
    try {
      const response = await updateCollectionStatus(backendApiCall, collectionId, {
        crop_id: crop_id,
        status: "completed",
      });
      if (response.status === "success") {
        refetchCollections((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <MoreOptions
        style={{ pointerEvents: isDropdownOpen ? "none" : "auto" }}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />

      {isDropdownOpen && (
        <Dropdown closeDropdown={() => setIsDropdownOpen(false)}>
          {actions.map((action) => (
            <Item
              key={action.name}
              onClick={() => {
                action.action();
                setIsDropdownOpen(false);
              }}
            >
              <span style={{ marginRight: "8px" }}>{action.icon}</span>
              <div>{action.name}</div>
            </Item>
          ))}
        </Dropdown>
      )}

      {isEditModalOpen && (
        <Modal title="Editar recolección" closeModal={() => setIsEditModalOpen(false)}>
          <CollectionFormEdit
            collection={collectionDetails}
            refetchCollections={refetchCollections}
          />
        </Modal>
      )}
    </>
  );
};
