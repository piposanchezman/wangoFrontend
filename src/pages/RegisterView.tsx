import React, { useState, useContext, useEffect } from "react";
import { Calendar } from "../components/modals/Calendar";
import { NotificationModal } from "../components/modals/NotificationModal";
import { useParams } from "react-router-dom";
import { fetchLotDetails } from "../services/lot_s";
import { ApiContext } from "../context/ApiContext";
import { LotI } from "../interfaces/Lot";
import { createNewCrop } from "../services/crop_s";
import { NotificationDataInit, NotificationI } from "../interfaces/notification";
import { fetchWeatherApi } from "openmeteo";
import {
  Button,
  ButtonSubmit,
  Description,
  DetailsItem,
  DetailsSign,
  Form,
  InfoContainer,
  Input,
  Label,
  Select,
  FormContainer,
  SignBoard,
} from "../styles/FormStyles";
import { Container, Table, TableRow, TableCell, TableRow2 } from "../styles/LotsTableStyles";
import { MainLayout } from "../layouts/MainLayout";

export const RegisterView = () => {
  const { id } = useParams();
  const lotId = id;
  const { backendApiCall } = useContext(ApiContext);
  const [refetch, setRefetch] = useState<number>(0);
  const [lotData, setLotData] = useState({} as LotI);
  const [formData, setFormData] = useState({
    cropName: "",
    area: "",
    latitude: "",
    longitude: "",
    selectedDate: new Date(), // Estado para almacenar la fecha seleccionada
    etapaActual: "",
    eto: "", // Agrega la propiedad eto para ET0
    etc: "", // Agrega la propiedad etc para ETc
  });
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationDetails, setNotificationDetails] =
    useState<NotificationI>(NotificationDataInit);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleDateChange = (date: Date) => {
    setFormData({
      ...formData,
      selectedDate: date, // Actualiza el estado con la nueva fecha seleccionada
    });
  };

  const handleNotification = (
    title: string,
    description: string,
    status: string,
    redirectUrl: string
  ) => {
    setNotificationDetails({ title, description, status, redirectUrl });
    setShowNotification(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!lotId) {
        handleNotification("Error", "No se ha encontrado el ID del lote", "error", "");
        return;
      }
      const response: any = await createNewCrop(backendApiCall, {
        area: parseInt(formData.area),
        lot_id: lotId,
        name: formData.cropName,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      if (response.status === "success") {
        // setFormData({
        //   cropName: "",
        //   area: "",
        //   latitude: "",
        //   longitude: "",
        // });
        setRefetch((prev) => prev + 1);
        setShowNotification(true);
        setNotificationDetails({
          title: "Estás cambiando un parámetro",
          description:
            "Si cambias la etapa de crecimiento en la que <br />  está el día, los registros de este también lo <br /> harán.",
          status: "error",
          redirectUrl: "",
        });
        return;
      }
      throw new Error("Server responded with status other than success.");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchLotDetails(backendApiCall, lotId as string);
      if (response.status === "success" && response.data !== undefined) {
        setLotData(response.data);
      }

      // Obtener los valores de ET0 y ETc del clima
      const params = {
        latitude: 15.9273,
        longitude: -75.2819,
        hourly: ["evapotranspiration", "et0_fao_evapotranspiration"],
        forecast_days: 1,
      };
      const url = "https://api.open-meteo.com/v1/forecast";
      const weatherResponse = await fetchWeatherApi(url, params);
      const weatherData = weatherResponse[0].hourly()!;
      const et0 = weatherData.variables(1)!.valuesArray()![23]; // Primer valor de ET0
      const etc = weatherData.variables(0)!.valuesArray()![23]; // Primer valor de ETc
      //Hacer un promedio
      // Actualizar el estado de formData con los valores de ET0 y ETc
      setFormData((prevState) => ({
        ...prevState,
        eto: et0.toString(), // Convertir el valor numérico a cadena
        etc: etc.toString(), // Convertir el valor numérico a cadena
      }));
    };
    fetchData();
  }, [backendApiCall, lotId, refetch]);

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  return (
    <MainLayout>
      <FormContainer>
        <SignBoard $custom2>Registros del día hechos en el cultivo {lotData.name}</SignBoard>
        <InfoContainer>
          <DetailsSign>
            Fecha de inicio de recolección: <DetailsItem>{lotData.capacity_in_use}</DetailsItem>
          </DetailsSign>
        </InfoContainer>
        <Description className="customDescription">
          Nota: Siendo administrador puedes ver los registros hechos por los usuarios encargados que
          has asignado a este cultivo. Incluso puedes hacer uno tu.
        </Description>
        <Calendar selected={formData.selectedDate} onChange={handleDateChange} />
        <SignBoard $custom2>Parámetros del día para el cultivo</SignBoard>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="eto">Evapotranspiración de referencia (ETo)</Label>
          <Input
            type="text"
            id="eto"
            name="eto"
            value={formData.eto} // Mostrar el valor de ET0
            onChange={handleChange}
            required
            disabled
          />

          <Label htmlFor="etapaActual">Etapa actual de crecimiento</Label>
          <Select
            id="etapaActual"
            name="etapaActual"
            value={formData.etapaActual}
            required
            disabled
          >
            <option value="1.75">Frutificación (Kc = 1.75)</option>{" "}
            {/* Está por default, pero el orden correcto es como está abajo */}
            <option value="0.9">Crecimiento vegetativo (Kc = 0.9)</option>
            <option value="1.35">Floración (Kc = 1.35)</option>
            <option value="1.75">Frutificación (Kc = 1.75)</option>
            <option value="1.5">Promedio (Kc = 1.5)</option>
          </Select>

          <Label htmlFor="etc">Evapotranspiración real del cultivo (ETc)</Label>
          <Input
            type="number"
            id="etc"
            name="etc"
            value={formData.etc} // Mostrar el valor de ETc
            onChange={handleChange}
            required
            disabled
          />

          <ButtonSubmit type="submit" $custom1>
            Guardar cambios
          </ButtonSubmit>

          <Button type="submit" $custom1>
            Hacer un registro
          </Button>

          <SignBoard $custom3>Registros de datos hechos hoy</SignBoard>
          <Container>
            <Table $custom1>
              <thead>
                <TableRow index={-1}>
                  <TableCell $custom>ID</TableCell>
                  <TableCell $custom>Nombres</TableCell>
                  <TableCell $custom>Acciones</TableCell>
                </TableRow>
              </thead>
              <tbody>
                <TableRow2 index={1}>
                  <TableCell $custom1>1</TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <a href="#">Edi </a>
                    <a href="#"> Eli </a>
                  </TableCell>
                </TableRow2>
                <TableRow2 index={2}>
                  <TableCell $custom1>2</TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <a href="#">Edi </a>
                    <a href="#"> Eli </a>
                  </TableCell>
                </TableRow2>
                <TableRow2 index={3}>
                  <TableCell $custom1>3</TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <a href="#">Edi </a>
                    <a href="#"> Eli </a>
                  </TableCell>
                </TableRow2>
              </tbody>
            </Table>
          </Container>
        </Form>
      </FormContainer>
      {showNotification && (
        <NotificationModal
          title={notificationDetails.title}
          description={notificationDetails.description}
          status={notificationDetails.status}
          buttonText="Aceptar"
          onClose={handleNotificationClose}
          redirectUrl={notificationDetails.redirectUrl}
        />
      )}
    </MainLayout>
  );
};
