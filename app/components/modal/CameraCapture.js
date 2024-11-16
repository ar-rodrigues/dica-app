import { useCallback, useState, forwardRef, useEffect, use  } from "react";
import Webcam from "react-webcam";
import { 
  Button, Box, Image, Flex, 
  Card, CardHeader, CardBody, 
  Modal, ModalOverlay, ModalContent,
  useDisclosure,
  Spinner
} from "@chakra-ui/react";
import { FaCamera, FaTimes, FaFileImage, FaTrash } from "react-icons/fa";
import { TbCapture } from "react-icons/tb";
import { v4 as uuidv4 } from "uuid"
import { fetchFiles } from "@/api/documents/storage/storage";
import { deleteFiles } from "@/utils/storage/storeFiles";
import { updateDocument } from "@/api/documents/documents"


const CameraCapture = forwardRef(({ register, name, rowData, isEditing=false, cameraModal: {isOpen, onOpen, onClose} }, ref) => {
  const editImageModal = useDisclosure()
  const [photos, setPhotos] = useState([])
  const [storedPhotos, setStoredPhotos] = useState([])
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if(rowData?.value && isEditing){
      setIsLoading(true)
      const getUrls = async ()=>{
        const urls = await Promise.all(rowData.value.map(async file=> {
          const url = await fetchFiles(file.path)
          return { dataURL: url.url, path: file.path }
        }))
        rowData?.editorCallback(urls)
        setIsLoading(false)
      }
      getUrls()
    }
  },[register])


  useEffect(() => {
    if(rowData?.value){
      rowData.editorCallback(rowData.value)
      setIsLoading(false)
    }
  }, [register, rowData?.value, isEditing])

  
  const capturePhoto = useCallback(() => {
    if(ref.current){
      // Get the screenshot as a data URL for display
      const imageSrc = ref.current.getScreenshot();

      // Convert data URL to File for uploading
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${uuidv4()}.jpeg`, { type: "image/jpeg" });
          const newPhoto = { dataURL: imageSrc, file }; // Keep both dataURL for display and File for upload
          setPhotos((prevPhotos) => {
            const updatedPhotos = [...prevPhotos, newPhoto];
            //console.log("updatedPhotos",updatedPhotos)
            rowData?.editorCallback([...updatedPhotos, ...rowData.value]);
            // Register photos with the form
            register(name).onChange({ target: { name, value: updatedPhotos } });
            return updatedPhotos;
          });
        });

      // Close the camera modal
      onClose()
    }
  }, [register, name, onClose, rowData?.editorCallback]);


  const handleRemovePhoto = useCallback(async (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    register(name).onChange({ target: { name, value: photos } });
  }, [register, name]);

  const handleEditingRemovePhoto = useCallback(async (photoUrl) => {
    const newRowData = rowData?.value.filter((photo) => photo.dataURL !== photoUrl )
    rowData?.editorCallback(newRowData)
    setSelectedPhotoUrl(null)
    editImageModal.onClose()
  })

  


  const PhotoGallery = (
      <Box  >
        {
          !isEditing && 
          <Flex wrap="wrap" w="fit" m={2} border="1px solid #eee" borderRadius="md" overflowX="auto" justify={"center"} align={"center"} minW={"40px"} >        
            {
              photos?.map((photo, index) =>{
                const photoUrl = photo.dataURL
                const photoImage = (
                  <Box key={index} position="relative" mr={2} mb={2} minW={"80px"} >
                    <Button onClick={() => handleRemovePhoto(index)} size="xs" position="absolute" top="1" right="1" colorScheme="red" zIndex="1">
                      <FaTimes />
                    </Button>
                    <Image src={photoUrl} w={20} h={20} objectFit="cover" rounded="md" />
                  </Box>
                )
                return photoImage;
              })
            }
          </Flex>
        }
        {
          isEditing && 
          <Flex wrap="wrap" w="fit" m={2} border="1px solid #eee" borderRadius="md" overflowX="auto" justify={"center"} align={"center"} minW={"40px"} >
            {
              rowData?.value.map((photo, index)=>{
                const photoUrl = photo.dataURL
                const photoIcon = (
                  <Flex key={index} justify={"center"} align={"center"} p={2}  minW={"80px"} >
                    <Button onClick={ () => {editImageModal.onOpen(),setSelectedPhotoUrl(photoUrl)} } size="xs" p={2} > <FaFileImage /> </Button>
                    <Modal isOpen={editImageModal.isOpen} onClose={ () => {editImageModal.onClose(), setSelectedPhotoUrl(null)} } size={"md"} >
                      <ModalOverlay />
                      <ModalContent >
                        <Button leftIcon={<FaTrash />} onClick={() => handleEditingRemovePhoto(selectedPhotoUrl)} size="sm" position="absolute" bottom="2" left="2" colorScheme="red" zIndex="1" >
                          Eliminar Imagen
                        </Button>
                        <Image src={selectedPhotoUrl} w={"full"} h={"full"} objectFit="cover" rounded="md" />
                      </ModalContent>
                    </Modal>
                  </Flex>
                )
                return photoIcon
              })
            }
          </Flex>
        }
      </Box>

  );
  
  const CameraHeader = (
    <>
      <CardHeader position={"absolute"} textAlign={"end"} width={"full"}  >
        <Button 
          onClick={() => {
            onClose()
          }} 
          position={"absolute"} 
          fontSize={"md"} 
          right={"10%"} 
          zIndex={1000} 
          variant='solid' 
          colorScheme='red' 
        >
          <FaTimes />
        </Button>
      </CardHeader>
    </>
  )
  const CameraContent = (
    <>
      <CardBody textAlign={"center"} placeItems={"center"} >
        <Webcam 
          ref={ref} 
          screenshotFormat="image/jpeg"
          videoConstraints={
            { facingMode: "environment" }
          } 
          />
        <Button variant='ghost' size={"lg"} onClick={capturePhoto} mt={5} ><TbCapture /></Button>
      </CardBody>
    </>
  );


  return (
    <Box mt={5} width={"full"} shadow={"none"} rounded={"md"} pb={2} >
      { 
        <Card width={"full"} p={1} shadow={isEditing ? "none" : "md"} rounded={"md"} >
          <Button 
            onClick={ () => {
               onOpen()
            }} 
            variant='ghost' 
            w={"full"} 
            p={4} 
            size={"lg"} 
          >
            <FaCamera />
          </Button>
        </Card>
      }
      <Modal isOpen={isOpen} onClose={onClose} size={"xl"} >
        <ModalOverlay />
        <ModalContent width={"full"} >
          <Card borderRadius={"md"} width={"full"} >
            { isOpen && CameraHeader }
            { isOpen && CameraContent}
          </Card>
        </ModalContent>
      </Modal>
      { isLoading && <Spinner size={"xs"} /> }
      { (photos?.length > 0 || !isLoading)  && PhotoGallery }
    </Box>
  );
});

export default CameraCapture;
