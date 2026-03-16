import numpy as np
import cv2 as cv

#from opencv_face_detection import haar_cascade

haar_cascade = cv.CascadeClassifier('haar_face.xml')

people = ['Liton Das','Mushfiqur Rahim','Tamim Iqbal']
#features = np.load('features.npy',allow_pickle=True)
#labels = np.load('labels.npy')

face_recognizer = cv.face.LBPHFaceRecognizer_create()
face_recognizer.read('face_recognizer.yml')

img = cv.imread(r'D:\Face_Training_Model\Validation\image-310203-1757426826.jpg')

gray = cv.cvtColor(img,cv.COLOR_BGR2GRAY)
cv.imshow('Person',gray)

#Detect the face in the image
faces_rect = haar_cascade.detectMultiScale(gray,1.1,4)

for (x,y,w,h) in faces_rect:
    faces_roi = gray[y:y+h,x:x+w]

    label,confidence = face_recognizer.predict(faces_roi)
    print(f'Label = {people[label]} with a confidence = {confidence}%')

    cv.putText(img,str(people[label]),(20,20),cv.FONT_HERSHEY_COMPLEX,1.0,(0,0,255),2)
    cv.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)

cv.imshow('Detected Face',img)
cv.waitKey(0)












