import { useCallback, useState, forwardRef  } from "react";
import Webcam from "react-webcam";
import { 
  Button, Box, Image, Flex, 
  Card, CardHeader, CardBody, 
  Modal, ModalOverlay, ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
import { FaCamera, FaTimes  } from "react-icons/fa";
import { TbCapture } from "react-icons/tb";
import { v4 as uuidv4 } from "uuid"


const CameraCapture = forwardRef(({ register, name }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const { isOpen:isModalOpen, onOpen, onClose } = useDisclosure()

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
            // Register photos with the form
            register(name).onChange({ target: { name, value: updatedPhotos.map(photo => photo.file) } });
            return updatedPhotos;
          });
        });

      // Close the camera modal
      setIsOpen(false)
      onClose()
    }
  }, [ register, name, onClose ]);

  const handleRemovePhoto = useCallback((index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    register(name).onChange({ target: { name, value: '' } });
  }, [register, name]);

  

  const PhotoGallery = photos.length > 0 && (

      <Flex wrap="wrap" w="fit" p={2} border="1px solid #eee" borderRadius="md" overflowX="auto" justify={"center"} align={"center"}  >
        {photos.map((photo, index) => (
          <Box key={index} position="relative" mr={2} mb={2} minW={"80px"} >
            <Button onClick={() => handleRemovePhoto(index)} size="xs" position="absolute" top="1" right="1" colorScheme="red" zIndex="1">
              <FaTimes />
            </Button>
            <Image src={photo.dataURL} w={20} h={20} objectFit="cover" rounded="md" />
          </Box>
        ))}
      </Flex>

  );
  
  const CameraHeader = (
    <>
      <CardHeader position={"absolute"} textAlign={"end"} width={"full"} >
        <Button 
          onClick={() => {
            setIsOpen(false)
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
      <CardBody textAlign={"center"} placeItems={"center"}>
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
    <Box mt={5} width={"full"} shadow={"md"} rounded={"md"} >
      { 
        <Card width={"full"} p={2}>
          <Button 
            onClick={ () => {
               setIsOpen(true)
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
      <Modal isOpen={isModalOpen} onClose={onClose} size={"xl"} >
        <ModalOverlay />
        <ModalContent width={"full"} >
          <Card borderRadius={"md"} width={"full"} >
            { isOpen && CameraHeader }
            { isOpen && CameraContent}
          </Card>
        </ModalContent>
      </Modal>
      { photos.length > 0 && PhotoGallery }
    </Box>
  );
});

export default CameraCapture;
