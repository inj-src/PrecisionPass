import os

import cv2
import cv2 as cv
import numpy as np


people = ['Liton Das','Mushfiqur Rahim','Tamim Iqbal']

p = []
for i in os.listdir(r'D:\Face_Training_Model\Faces'):
    p.append(i)
#
# print(p)
#
# # Get all filenames without extensions
# p = [os.path.splitext(f)[0] for f in os.listdir(r'D:\Face_Training_Model')]
# print(p)

#Use ctrl+/ to comment and comment out multiple lines of codes

DIR=r'D:\Face_Training_Model\Faces'
haar_cascade = cv.CascadeClassifier('haar_face.xml')

features=[]
labels=[]

def create_train():
    for person in people:
        path = os.path.join(DIR,person)
        label = people.index(person)

        for img in os.listdir(path):
            img_path = os.path.join(path,img)
            img_array = cv2.imread(img_path)
            gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
            faces_rect = haar_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
            for (x,y,w,h) in faces_rect:
                faces_roi = gray[y:y+h,x:x+w]
                features.append(faces_roi)
                labels.append(label)


create_train()
print('Training done ----------------------------------')
# print(f'Length of the features = {len(features)}')
# print(f'Length of the labels = {len(labels)}')

features = np.array(features,dtype='object')
labels = np.array(labels)

face_recognizer = cv.face.LBPHFaceRecognizer_create()

#Tarin the recognizer on the features list and the labels list
face_recognizer.train(features,labels)

face_recognizer.save('face_recognizer.yml')
np.save('features.npy',features)
np.save('labels.npy',labels)



























