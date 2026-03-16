#import cv2
#print(cv2.__version__)

#Face detection with haar cascade method

import cv2 as cv
img=cv.imread(r'D:\Face_Training_Model\Validation\image-310203-1757426826.jpg')
cv.imshow('Person',img)

gray=cv.cvtColor(img,cv.COLOR_BGR2GRAY)
cv.imshow("Gray Person",gray)

haar_cascade = cv.CascadeClassifier('haar_face.xml')
faces_rect = haar_cascade.detectMultiScale(gray,scaleFactor=1.1,minNeighbors=7)
print(f'Number of faces found = {len(faces_rect)}')


for (x,y,w,h) in faces_rect:
    cv.rectangle(img,(x,y),(x+w,y+h),(0,255,0),thickness=2)
cv.imshow('Detected Face',img)



cv.waitKey(0)
cv.destroyAllWindows()