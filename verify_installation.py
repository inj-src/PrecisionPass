import cv2
#load the image
image=cv2.imread(r"C:\Users\User\Pictures\Bill Gates.jpg")
if image is None:
    print("Image not loaded")
    exit(0)


#convert image to grayscale
gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)

#show image
cv2.imshow("Original",image)
cv2.imshow("Gray",gray)

cv2.waitKey(0)
cv2.destroyAllWindows()