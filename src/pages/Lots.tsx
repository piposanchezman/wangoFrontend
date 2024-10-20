import React, { useState, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { LotForm } from "../components/LotForm";
import { TableV1 } from "../components/tables/TableV1";
import { Modal } from "../components/modals/Modal";
import { LotActions } from "../components/actions/LotActions";
import { MainLayout } from "../layouts/MainLayout";
import { UseGet } from "../hooks/UseGet";
import { UsePagination } from "../hooks/UsePagination";
import { LotI } from "../interfaces/Lot";
import { ButtonSecondary } from "../styles/AddLoteStyles";
import { Text } from "../styles/MainMenuStyles";
import { LoadingAnimation } from "../components/Loading";

// Custom hook to handle data fetching and pagination logic
const useLotsData = (currentPage: number, rowsPerPage: number) => {
  return UseGet({
    endpoint: `v1/lot/paginated?page=${currentPage}&limit=${rowsPerPage}`,
  });
};

export const Lots: React.FC = () => {
  const { userData } = useContext(AppContext);
  const { currentPage, setCurrentPage, rowsPerPage, setRowsPerPage } = UsePagination();
  const { data, loading, setRefetch } = useLotsData(currentPage, rowsPerPage);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized columns definition
  const columns = useCallback(
    () => [
      {
        title: "Lote",
        dataIndex: "name",
        render: (lot: LotI) => <span>{lot.name}</span>,
      },
      {
        title: "Capacidad total",
        dataIndex: "capacity",
        render: (lot: LotI) => <span>{lot.capacity}</span>,
      },
      {
        title: "Capacidad disponible",
        dataIndex: "available_capacity",
        render: (lot: LotI) => <span>{lot.available_capacity}</span>,
      },
      {
        title: "Acciones",
        dataIndex: "_id",
        render: (lot: LotI) => (
          <LotActions lotDetails={lot} refetchLotDetails={() => setRefetch((prev) => prev + 1)} />
        ),
      },
    ],
    [setRefetch]
  );

  return (
    <MainLayout>
      <Header userName={userData.name} onOpenModal={() => setIsModalOpen(true)} />
      {loading ? (
        <LoadingAnimation />
      ) : data?.lots?.length > 0 ? (
        <TableV1
          evencolor="#FFFFFF"
          oddcolor="rgb(255, 103, 15, 0.2)"
          data={data.lots}
          pagination={{
            rowsPerPage,
            setRowsPerPage,
            currentPage,
            setCurrentPage,
            setRefetch,
            totalPages: data.meta.totalQ_pages,
          }}
          title="Lotes"
          columns={columns()}
        />
      ) : (
        <p>No lots found</p>
      )}

      {isModalOpen && (
        <Modal title="Crear Lote" closeModal={() => setIsModalOpen(false)}>
          <LotForm />
        </Modal>
      )}
    </MainLayout>
  );
};

// A separate Header component for better readability
const Header: React.FC<{ userName: string; onOpenModal: () => void }> = ({
  userName,
  onOpenModal,
}) => (
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
    <Text>Estos son tus lotes, {userName}!</Text>
    <ButtonSecondary onClick={onOpenModal}>
      <span>
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginRight: "6px" }}
        >
          <path d="M11 13v6h2v-6h6v-2h-6V5h-2v6H5v2h6z" fill="currentColor"></path>
        </svg>
      </span>
      Crear Lote
    </ButtonSecondary>
  </div>
);
