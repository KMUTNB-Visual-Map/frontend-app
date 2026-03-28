// src/data/landmark.ts
export interface Landmark {
  node_id: number;
  floor_id: number;
  name_th: string;
  name_eng: string;
  type: string;
  lng: number;
  lat: number;
}

export const LANDMARKS_DATA: Landmark[] = [
      {
        "node_id": 1,
        "floor_id": 1,
        "name_th": "สมาคมศิษย์เก่า",
        "name_eng": "Alumni Association",
        "type": "room",
        "lng": 100.51377971386,
        "lat": 13.8211828414507
      },
      {
        "node_id": 2,
        "floor_id": 1,
        "name_th": "สโมสรนิสิต",
        "name_eng": "Student Association",
        "type": "room",
        "lng": 100.513758147492,
        "lat": 13.821248691387
      },
      {
        "node_id": 3,
        "floor_id": 1,
        "name_th": "ร้านค้า",
        "name_eng": "Shop",
        "type": "room",
        "lng": 100.513699073471,
        "lat": 13.8211609046339
      },
      {
        "node_id": 4,
        "floor_id": 1,
        "name_th": "บันได 1_01",
        "name_eng": "Stair 1_01",
        "type": "stair",
        "lng": 100.51368651993,
        "lat": 13.8212495174225
      },
      {
        "node_id": 6,
        "floor_id": 1,
        "name_th": "ลิฟต์_ชั้น 1_01",
        "name_eng": "Elevator_level 1_01",
        "type": "elevator",
        "lng": 100.513593080411,
        "lat": 13.8211993627484
      },
      {
        "node_id": 7,
        "floor_id": 1,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 1_01",
        "name_eng": "Toilet_F_level 1_01",
        "type": "room",
        "lng": 100.513570347373,
        "lat": 13.8211907382902
      },
      {
        "node_id": 8,
        "floor_id": 1,
        "name_th": "ลิฟต์_ชั้น 1_02",
        "name_eng": "Elevator_level 1_02",
        "type": "elevator",
        "lng": 100.513565131497,
        "lat": 13.8212168635085
      },
      {
        "node_id": 9,
        "floor_id": 1,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 1_01",
        "name_eng": "Toilet_M_level 1_01",
        "type": "room",
        "lng": 100.513524478847,
        "lat": 13.8212182853882
      },
      {
        "node_id": 5,
        "floor_id": 1,
        "name_th": "บันได_ชั้น 1_01",
        "name_eng": "Stair_level 1_01",
        "type": "stair",
        "lng": 100.513614646217,
        "lat": 13.8211891038913
      },
      {
        "node_id": 10,
        "floor_id": 1,
        "name_th": "บันได 1_02",
        "name_eng": "Stair 1_02",
        "type": "stair",
        "lng": 100.513483845744,
        "lat": 13.8212239701813
      },
      {
        "node_id": 11,
        "floor_id": 1,
        "name_th": "ทางเดิน 1_01",
        "name_eng": "Hallway 1_01",
        "type": "hallway",
        "lng": 100.513568648904,
        "lat": 13.8213211277661
      },
      {
        "node_id": 12,
        "floor_id": 1,
        "name_th": "ทางเดิน 1_05",
        "name_eng": "Hallway 1_05",
        "type": "hallway",
        "lng": 100.513601499907,
        "lat": 13.8213710923208
      },
      {
        "node_id": 13,
        "floor_id": 1,
        "name_th": "ทางเดิน 1_02",
        "name_eng": "Hallway 1_02",
        "type": "hallway",
        "lng": 100.513434018642,
        "lat": 13.8214045431539
      },
      {
        "node_id": 14,
        "floor_id": 1,
        "name_th": "ทางเดิน 1_03",
        "name_eng": "Hallway 1_03",
        "type": "hallway",
        "lng": 100.513296213756,
        "lat": 13.8214879066537
      },
      {
        "node_id": 15,
        "floor_id": 1,
        "name_th": "บันได 1_03",
        "name_eng": "Stair 1_03",
        "type": "stair",
        "lng": 100.513225066543,
        "lat": 13.8213788192921
      },
      {
        "node_id": 18,
        "floor_id": 2,
        "name_th": "ทางเข้า_ชั้น 2",
        "name_eng": "Entrance_level 2",
        "type": "entrance",
        "lng": 100.513706360091,
        "lat": 13.8212330262776
      },
      {
        "node_id": 22,
        "floor_id": 2,
        "name_th": "ลิฟต์_ชั้น 2_01",
        "name_eng": "Elevator_level 2_01",
        "type": "elevator",
        "lng": 100.513590154174,
        "lat": 13.8211905253864
      },
      {
        "node_id": 38,
        "floor_id": 3,
        "name_th": "กองบริการการศึกษา",
        "name_eng": "Academic Office",
        "type": "room",
        "lng": 100.513601902716,
        "lat": 13.8212618257425
      },
      {
        "node_id": 54,
        "floor_id": 3,
        "name_th": "บันได_ชั้น 3_02",
        "name_eng": "Stair_level 3_02",
        "type": "stair",
        "lng": 100.51335044911,
        "lat": 13.8215603101415
      },
      {
        "node_id": 62,
        "floor_id": 4,
        "name_th": "บันได_ชั้น 4_01",
        "name_eng": "Stair_level 4_01",
        "type": "stair",
        "lng": 100.513608687501,
        "lat": 13.8211780275284
      },
      {
        "node_id": 17,
        "floor_id": 1,
        "name_th": "ทางเดิน 1_04",
        "name_eng": "Hallway 1_04",
        "type": "hallway",
        "lng": 100.513181914355,
        "lat": 13.8215568710734
      },
      {
        "node_id": 21,
        "floor_id": 2,
        "name_th": "บันได_ชั้น 2_01",
        "name_eng": "Stair_level 2_01",
        "type": "stair",
        "lng": 100.513609065444,
        "lat": 13.8211784091188
      },
      {
        "node_id": 29,
        "floor_id": 2,
        "name_th": "ทางเดิน 2_03",
        "name_eng": "Hallway 2_03",
        "type": "hallway",
        "lng": 100.513440799386,
        "lat": 13.8214413437016
      },
      {
        "node_id": 31,
        "floor_id": 2,
        "name_th": "ทางเดิน 2_04",
        "name_eng": "Hallway 2_04",
        "type": "hallway",
        "lng": 100.513320247412,
        "lat": 13.821522516608
      },
      {
        "node_id": 35,
        "floor_id": 2,
        "name_th": "ทางเดิน 2_05",
        "name_eng": "Hallway 2_05",
        "type": "hallway",
        "lng": 100.513211568364,
        "lat": 13.8215917734625
      },
      {
        "node_id": 44,
        "floor_id": 3,
        "name_th": "ทางเดิน 3_06",
        "name_eng": "Hallway 3_06",
        "type": "hallway",
        "lng": 100.513599507843,
        "lat": 13.8213660917641
      },
      {
        "node_id": 50,
        "floor_id": 3,
        "name_th": "ทางเดิน 3_02",
        "name_eng": "Hallway 3_02",
        "type": "hallway",
        "lng": 100.513410809822,
        "lat": 13.8213227875668
      },
      {
        "node_id": 51,
        "floor_id": 3,
        "name_th": "ทางเดิน 3_03",
        "name_eng": "Hallway 3_03",
        "type": "hallway",
        "lng": 100.513253410857,
        "lat": 13.8214220925122
      },
      {
        "node_id": 58,
        "floor_id": 3,
        "name_th": "ทางเดิน 3_05",
        "name_eng": "Hallway 3_05",
        "type": "hallway",
        "lng": 100.513207248977,
        "lat": 13.821600193039
      },
      {
        "node_id": 67,
        "floor_id": 4,
        "name_th": "ทางเดิน 4_01",
        "name_eng": "Hallway 4_01",
        "type": "hallway",
        "lng": 100.513625916163,
        "lat": 13.8212327299292
      },
      {
        "node_id": 69,
        "floor_id": 4,
        "name_th": "ทางเดิน 4_02",
        "name_eng": "Hallway 4_02",
        "type": "hallway",
        "lng": 100.513418185919,
        "lat": 13.8213764202384
      },
      {
        "node_id": 84,
        "floor_id": 4,
        "name_th": "ทางเดิน 4_04",
        "name_eng": "Hallway 4_04",
        "type": "hallway",
        "lng": 100.51324168131,
        "lat": 13.8214003600501
      },
      {
        "node_id": 90,
        "floor_id": 4,
        "name_th": "ทางเดิน 4_05",
        "name_eng": "Hallway 4_05",
        "type": "hallway",
        "lng": 100.513323266953,
        "lat": 13.8215207869126
      },
      {
        "node_id": 91,
        "floor_id": 4,
        "name_th": "ทางเดิน 4_06",
        "name_eng": "Hallway 4_06",
        "type": "hallway",
        "lng": 100.513215694585,
        "lat": 13.821589060939
      },
      {
        "node_id": 97,
        "floor_id": 5,
        "name_th": "507",
        "name_eng": "507",
        "type": "room",
        "lng": 100.513713056571,
        "lat": 13.8211968679627
      },
      {
        "node_id": 20,
        "floor_id": 2,
        "name_th": "ทางเดิน 2_01",
        "name_eng": "Hallway 2_01",
        "type": "hallway",
        "lng": 100.513570944309,
        "lat": 13.8213201419059
      },
      {
        "node_id": 24,
        "floor_id": 2,
        "name_th": "ลิฟต์_ชั้น 2_02",
        "name_eng": "Elevator_level 2_02",
        "type": "elevator",
        "lng": 100.513564530686,
        "lat": 13.8212076108279
      },
      {
        "node_id": 41,
        "floor_id": 3,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 3_01",
        "name_eng": "Toilet_F_level 3_01",
        "type": "room",
        "lng": 100.513572302087,
        "lat": 13.8211995449624
      },
      {
        "node_id": 33,
        "floor_id": 2,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 2_02",
        "name_eng": "Toilet_M_level 2_02",
        "type": "room",
        "lng": 100.513326732899,
        "lat": 13.8215622729457
      },
      {
        "node_id": 28,
        "floor_id": 2,
        "name_th": "ห้องประชุมชั้น2",
        "name_eng": "Meeting_room_2",
        "type": "room",
        "lng": 100.513412013622,
        "lat": 13.8213071428194
      },
      {
        "node_id": 32,
        "floor_id": 2,
        "name_th": "บันได_ชั้น 2_02",
        "name_eng": "Stair_level 2_02",
        "type": "stair",
        "lng": 100.513347201933,
        "lat": 13.8215534271714
      },
      {
        "node_id": 45,
        "floor_id": 3,
        "name_th": "แผนกการเงิน",
        "name_eng": "Finance Office",
        "type": "room",
        "lng": 100.513500138777,
        "lat": 13.821288097184
      },
      {
        "node_id": 55,
        "floor_id": 3,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 3_02",
        "name_eng": "Toilet_M_level 3_02",
        "type": "room",
        "lng": 100.513325414994,
        "lat": 13.8215656879899
      },
      {
        "node_id": 64,
        "floor_id": 4,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 4_01",
        "name_eng": "Toilet_F_level 4_01",
        "type": "room",
        "lng": 100.513574945677,
        "lat": 13.8211990661342
      },
      {
        "node_id": 46,
        "floor_id": 3,
        "name_th": "ห้องทานอาหาร",
        "name_eng": "breaking room",
        "type": "room",
        "lng": 100.513466207837,
        "lat": 13.821267682069
      },
      {
        "node_id": 48,
        "floor_id": 3,
        "name_th": "ห้องหัวหน้าสำนักงาน",
        "name_eng": "Office Head Room",
        "type": "room",
        "lng": 100.513410617899,
        "lat": 13.8213041381014
      },
      {
        "node_id": 94,
        "floor_id": 4,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 4_02",
        "name_eng": "Toilet_F_level 4_02",
        "type": "room",
        "lng": 100.513307368144,
        "lat": 13.8215725144949
      },
      {
        "node_id": 66,
        "floor_id": 4,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 4_01",
        "name_eng": "Toilet_M_level 4_01",
        "type": "room",
        "lng": 100.513539618627,
        "lat": 13.8212241761742
      },
      {
        "node_id": 57,
        "floor_id": 3,
        "name_th": "ศูนย์อบรมวิทยาการด้านหุ่นยนต์",
        "name_eng": "Robot Academy",
        "type": "room",
        "lng": 100.513264263196,
        "lat": 13.8215494719581
      },
      {
        "node_id": 59,
        "floor_id": 4,
        "name_th": "1402",
        "name_eng": "1402",
        "type": "room",
        "lng": 100.513660807131,
        "lat": 13.8212234242629
      },
      {
        "node_id": 60,
        "floor_id": 4,
        "name_th": "1403",
        "name_eng": "1403",
        "type": "room",
        "lng": 100.513660139356,
        "lat": 13.8212057633122
      },
      {
        "node_id": 61,
        "floor_id": 4,
        "name_th": "1404",
        "name_eng": "1404",
        "type": "room",
        "lng": 100.513652147512,
        "lat": 13.8211861967033
      },
      {
        "node_id": 68,
        "floor_id": 4,
        "name_th": "1436",
        "name_eng": "1436",
        "type": "room",
        "lng": 100.513608357162,
        "lat": 13.8212595485175
      },
      {
        "node_id": 70,
        "floor_id": 4,
        "name_th": "1433",
        "name_eng": "1433",
        "type": "room",
        "lng": 100.513423978337,
        "lat": 13.8213855499931
      },
      {
        "node_id": 26,
        "floor_id": 2,
        "name_th": "ห้องควบคุม",
        "name_eng": "Control_room",
        "type": "room",
        "lng": 100.513491188014,
        "lat": 13.8212535505662
      },
      {
        "node_id": 71,
        "floor_id": 4,
        "name_th": "1408",
        "name_eng": "1408",
        "type": "room",
        "lng": 100.51355064234,
        "lat": 13.8212693612247
      },
      {
        "node_id": 72,
        "floor_id": 4,
        "name_th": "1409",
        "name_eng": "1409",
        "type": "room",
        "lng": 100.513523716882,
        "lat": 13.8212860920937
      },
      {
        "node_id": 73,
        "floor_id": 4,
        "name_th": "1410",
        "name_eng": "1410",
        "type": "room",
        "lng": 100.513496651369,
        "lat": 13.8213042718113
      },
      {
        "node_id": 74,
        "floor_id": 4,
        "name_th": "1411",
        "name_eng": "1411",
        "type": "room",
        "lng": 100.513470751578,
        "lat": 13.8213207370842
      },
      {
        "node_id": 75,
        "floor_id": 4,
        "name_th": "1412",
        "name_eng": "1412",
        "type": "room",
        "lng": 100.513443974665,
        "lat": 13.8213378709162
      },
      {
        "node_id": 76,
        "floor_id": 4,
        "name_th": "1413",
        "name_eng": "1413",
        "type": "room",
        "lng": 100.513416888026,
        "lat": 13.8213557088406
      },
      {
        "node_id": 77,
        "floor_id": 4,
        "name_th": "1414",
        "name_eng": "1414",
        "type": "room",
        "lng": 100.51339036312,
        "lat": 13.821372347753
      },
      {
        "node_id": 78,
        "floor_id": 4,
        "name_th": "1415",
        "name_eng": "1415",
        "type": "room",
        "lng": 100.513363118786,
        "lat": 13.8213899204495
      },
      {
        "node_id": 79,
        "floor_id": 4,
        "name_th": "1416",
        "name_eng": "1416",
        "type": "room",
        "lng": 100.513336520694,
        "lat": 13.8214076612907
      },
      {
        "node_id": 80,
        "floor_id": 4,
        "name_th": "1417",
        "name_eng": "1417",
        "type": "room",
        "lng": 100.513309076413,
        "lat": 13.8214242851812
      },
      {
        "node_id": 81,
        "floor_id": 4,
        "name_th": "1432",
        "name_eng": "1432",
        "type": "room",
        "lng": 100.513316961512,
        "lat": 13.8214546974373
      },
      {
        "node_id": 83,
        "floor_id": 4,
        "name_th": "พื้นที่ทำงานร่วมกัน",
        "name_eng": "co-workingspace",
        "type": "room",
        "lng": 100.513261700953,
        "lat": 13.8214750693259
      },
      {
        "node_id": 85,
        "floor_id": 4,
        "name_th": "1431",
        "name_eng": "1431",
        "type": "room",
        "lng": 100.513218253671,
        "lat": 13.821409958025
      },
      {
        "node_id": 87,
        "floor_id": 4,
        "name_th": "ห้องเรียน2",
        "name_eng": "Lecture_room_2",
        "type": "room",
        "lng": 100.513309511258,
        "lat": 13.8213433024634
      },
      {
        "node_id": 88,
        "floor_id": 4,
        "name_th": "ห้องเรียน3",
        "name_eng": "Lecture_room_3",
        "type": "room",
        "lng": 100.513364155695,
        "lat": 13.821310177771
      },
      {
        "node_id": 89,
        "floor_id": 4,
        "name_th": "ห้องเรียน4",
        "name_eng": "Lecture_room_4",
        "type": "room",
        "lng": 100.513417083625,
        "lat": 13.8212750283649
      },
      {
        "node_id": 40,
        "floor_id": 3,
        "name_th": "ลิฟต์_ชั้น 3_01",
        "name_eng": "Elevator_level 3_01",
        "type": "elevator",
        "lng": 100.513584231146,
        "lat": 13.8211904523774
      },
      {
        "node_id": 42,
        "floor_id": 3,
        "name_th": "ลิฟต์_ชั้น 3_02",
        "name_eng": "Elevator_level 3_02",
        "type": "elevator",
        "lng": 100.513557443349,
        "lat": 13.8212078752708
      },
      {
        "node_id": 65,
        "floor_id": 4,
        "name_th": "ลิฟต์_ชั้น 4_02",
        "name_eng": "Elevator_level 4_02",
        "type": "elevator",
        "lng": 100.513564231597,
        "lat": 13.821208609147
      },
      {
        "node_id": 23,
        "floor_id": 2,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 2_01",
        "name_eng": "Toilet_F_level 2_01",
        "type": "room",
        "lng": 100.513577681063,
        "lat": 13.8211993616704
      },
      {
        "node_id": 16,
        "floor_id": 1,
        "name_th": "บันได_ชั้น 1_02",
        "name_eng": "Stair_level 1_02",
        "type": "stair",
        "lng": 100.513312520757,
        "lat": 13.8215385985499
      },
      {
        "node_id": 19,
        "floor_id": 2,
        "name_th": "ห้องภาควิชาไฟฟ้าและคอมพิวเตอร์",
        "name_eng": "Department of Electrical and Computer Engineering",
        "type": "room",
        "lng": 100.513649182536,
        "lat": 13.8213258615255
      },
      {
        "node_id": 63,
        "floor_id": 4,
        "name_th": "ลิฟต์_ชั้น 4_01",
        "name_eng": "Elevator_level 4_01",
        "type": "elevator",
        "lng": 100.513588748737,
        "lat": 13.821189205871
      },
      {
        "node_id": 34,
        "floor_id": 2,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 2_02",
        "name_eng": "Toilet_F_level 2_02",
        "type": "room",
        "lng": 100.513308413832,
        "lat": 13.8215747347455
      },
      {
        "node_id": 56,
        "floor_id": 3,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 3_02",
        "name_eng": "Toilet_F_level 3_02",
        "type": "room",
        "lng": 100.51330807091,
        "lat": 13.8215773354511
      },
      {
        "node_id": 25,
        "floor_id": 2,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 2_01",
        "name_eng": "Toilet_M_level 2_01",
        "type": "room",
        "lng": 100.513539688801,
        "lat": 13.8212250444777
      },
      {
        "node_id": 43,
        "floor_id": 3,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 3_01",
        "name_eng": "Toilet_M_level 3_01",
        "type": "room",
        "lng": 100.513531241487,
        "lat": 13.8212254506181
      },
      {
        "node_id": 93,
        "floor_id": 4,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 4_02",
        "name_eng": "Toilet_M_level 4_02",
        "type": "room",
        "lng": 100.513324167761,
        "lat": 13.8215611047217
      },
      {
        "node_id": 30,
        "floor_id": 2,
        "name_th": "ห้องคณบดี",
        "name_eng": "Dean's Office",
        "type": "room",
        "lng": 100.513247180359,
        "lat": 13.8214170860898
      },
      {
        "node_id": 36,
        "floor_id": 3,
        "name_th": "ห้องประชุมวิจิตรวาที",
        "name_eng": "Lecture Theater",
        "type": "room",
        "lng": 100.513647979097,
        "lat": 13.8211927082279
      },
      {
        "node_id": 47,
        "floor_id": 3,
        "name_th": "ห้องประชุมย่อย",
        "name_eng": "small meeting room",
        "type": "room",
        "lng": 100.51342371883,
        "lat": 13.8212953504309
      },
      {
        "node_id": 49,
        "floor_id": 3,
        "name_th": "ห้องทำงานผู้เชี่ยวชาญ",
        "name_eng": "Office",
        "type": "room",
        "lng": 100.513373643453,
        "lat": 13.8213277529119
      },
      {
        "node_id": 52,
        "floor_id": 3,
        "name_th": "ห้องเอนกประสงค์",
        "name_eng": "Multipurpose room",
        "type": "room",
        "lng": 100.513218483465,
        "lat": 13.8213700123893
      },
      {
        "node_id": 86,
        "floor_id": 4,
        "name_th": "ห้องเรียน1",
        "name_eng": "Lecture_room_1",
        "type": "room",
        "lng": 100.513256258299,
        "lat": 13.8213796297607
      },
      {
        "node_id": 27,
        "floor_id": 2,
        "name_th": "ทางเดิน 2_05",
        "name_eng": "Hallway 2_05",
        "type": "hallway",
        "lng": 100.513597958675,
        "lat": 13.8213602478963
      },
      {
        "node_id": 37,
        "floor_id": 3,
        "name_th": "ทางเดิน 3_01",
        "name_eng": "Hallway 3_01",
        "type": "hallway",
        "lng": 100.513530740794,
        "lat": 13.8212670930663
      },
      {
        "node_id": 53,
        "floor_id": 3,
        "name_th": "ทางเดิน 3_04",
        "name_eng": "Hallway 3_04",
        "type": "hallway",
        "lng": 100.513321622767,
        "lat": 13.8215276547226
      },
      {
        "node_id": 82,
        "floor_id": 4,
        "name_th": "ทางเดิน 4_03",
        "name_eng": "Hallway 4_03",
        "type": "hallway",
        "lng": 100.513282936343,
        "lat": 13.8214608654474
      },
      {
        "node_id": 39,
        "floor_id": 3,
        "name_th": "บันได_ชั้น 3_01",
        "name_eng": "Stair_level 3_01",
        "type": "stair",
        "lng": 100.513604290443,
        "lat": 13.8211792064601
      },
      {
        "node_id": 92,
        "floor_id": 4,
        "name_th": "บันได_ชั้น 4_02",
        "name_eng": "Stair_level 4_02",
        "type": "stair",
        "lng": 100.513345716445,
        "lat": 13.8215525086982
      },
      {
        "node_id": 111,
        "floor_id": 5,
        "name_th": "ลิฟต์_ชั้น 5_01",
        "name_eng": "Elevator_level 5_01",
        "type": "elevator",
        "lng": 100.513583595211,
        "lat": 13.8211873434933
      },
      {
        "node_id": 113,
        "floor_id": 5,
        "name_th": "ลิฟต์_ชั้น 5_02",
        "name_eng": "Elevator_level 5_02",
        "type": "elevator",
        "lng": 100.513559346013,
        "lat": 13.8212084772428
      },
      {
        "node_id": 131,
        "floor_id": 6,
        "name_th": "ลิฟต์_ชั้น 6_01",
        "name_eng": "Elevator_level 6_01",
        "type": "elevator",
        "lng": 100.513585089494,
        "lat": 13.8211892436175
      },
      {
        "node_id": 133,
        "floor_id": 6,
        "name_th": "ลิฟต์_ชั้น 6_02",
        "name_eng": "Elevator_level 6_02",
        "type": "elevator",
        "lng": 100.513559510884,
        "lat": 13.8212096056489
      },
      {
        "node_id": 115,
        "floor_id": 5,
        "name_th": "510",
        "name_eng": "510",
        "type": "room",
        "lng": 100.513547990552,
        "lat": 13.821271167845
      },
      {
        "node_id": 116,
        "floor_id": 5,
        "name_th": "514",
        "name_eng": "514",
        "type": "room",
        "lng": 100.513521192686,
        "lat": 13.8212885807166
      },
      {
        "node_id": 117,
        "floor_id": 5,
        "name_th": "518",
        "name_eng": "518",
        "type": "room",
        "lng": 100.513370399076,
        "lat": 13.8213879851486
      },
      {
        "node_id": 118,
        "floor_id": 5,
        "name_th": "520",
        "name_eng": "520",
        "type": "room",
        "lng": 100.513268995444,
        "lat": 13.8214535967221
      },
      {
        "node_id": 124,
        "floor_id": 6,
        "name_th": "601",
        "name_eng": "601",
        "type": "room",
        "lng": 100.51374088863,
        "lat": 13.8211855878679
      },
      {
        "node_id": 125,
        "floor_id": 6,
        "name_th": "602",
        "name_eng": "602",
        "type": "room",
        "lng": 100.513733073752,
        "lat": 13.8211735191918
      },
      {
        "node_id": 127,
        "floor_id": 6,
        "name_th": "603",
        "name_eng": "603",
        "type": "room",
        "lng": 100.513681355609,
        "lat": 13.8212135570248
      },
      {
        "node_id": 128,
        "floor_id": 6,
        "name_th": "604",
        "name_eng": "604",
        "type": "room",
        "lng": 100.513659955046,
        "lat": 13.8211952142815
      },
      {
        "node_id": 135,
        "floor_id": 6,
        "name_th": "605",
        "name_eng": "605",
        "type": "room",
        "lng": 100.513576117698,
        "lat": 13.8212776522968
      },
      {
        "node_id": 136,
        "floor_id": 6,
        "name_th": "606",
        "name_eng": "606",
        "type": "room",
        "lng": 100.51354645531,
        "lat": 13.8212678787456
      },
      {
        "node_id": 95,
        "floor_id": 5,
        "name_th": "506",
        "name_eng": "506",
        "type": "room",
        "lng": 100.51374349176,
        "lat": 13.8211882740876
      },
      {
        "node_id": 137,
        "floor_id": 6,
        "name_th": "607",
        "name_eng": "607",
        "type": "room",
        "lng": 100.513553386423,
        "lat": 13.821293175502
      },
      {
        "node_id": 138,
        "floor_id": 6,
        "name_th": "608",
        "name_eng": "608",
        "type": "room",
        "lng": 100.513445331761,
        "lat": 13.8213296673543
      },
      {
        "node_id": 139,
        "floor_id": 6,
        "name_th": "609",
        "name_eng": "609",
        "type": "room",
        "lng": 100.513500204132,
        "lat": 13.8213280866384
      },
      {
        "node_id": 141,
        "floor_id": 6,
        "name_th": "611",
        "name_eng": "611",
        "type": "room",
        "lng": 100.513413240194,
        "lat": 13.8213824000981
      },
      {
        "node_id": 142,
        "floor_id": 6,
        "name_th": "610",
        "name_eng": "610",
        "type": "room",
        "lng": 100.513366969147,
        "lat": 13.8213824011321
      },
      {
        "node_id": 143,
        "floor_id": 6,
        "name_th": "613",
        "name_eng": "613",
        "type": "room",
        "lng": 100.51336195745,
        "lat": 13.8214180991324
      },
      {
        "node_id": 144,
        "floor_id": 6,
        "name_th": "615",
        "name_eng": "615",
        "type": "room",
        "lng": 100.513307591153,
        "lat": 13.821451821183
      },
      {
        "node_id": 145,
        "floor_id": 6,
        "name_th": "612",
        "name_eng": "612",
        "type": "room",
        "lng": 100.513263562594,
        "lat": 13.8214491753589
      },
      {
        "node_id": 146,
        "floor_id": 6,
        "name_th": "617",
        "name_eng": "617",
        "type": "room",
        "lng": 100.513260077843,
        "lat": 13.8214826276475
      },
      {
        "node_id": 147,
        "floor_id": 6,
        "name_th": "614",
        "name_eng": "614",
        "type": "room",
        "lng": 100.513211498105,
        "lat": 13.8214931873098
      },
      {
        "node_id": 148,
        "floor_id": 6,
        "name_th": "619",
        "name_eng": "619",
        "type": "room",
        "lng": 100.513174862241,
        "lat": 13.8215382769711
      },
      {
        "node_id": 149,
        "floor_id": 6,
        "name_th": "616",
        "name_eng": "616",
        "type": "room",
        "lng": 100.513156884731,
        "lat": 13.821528900728
      },
      {
        "node_id": 96,
        "floor_id": 5,
        "name_th": "504",
        "name_eng": "504",
        "type": "room",
        "lng": 100.513735696872,
        "lat": 13.8211768244932
      },
      {
        "node_id": 98,
        "floor_id": 5,
        "name_th": "ทางเดิน 5_01",
        "name_eng": "Hallway 5_01",
        "type": "hallway",
        "lng": 100.513704373538,
        "lat": 13.8211844781409
      },
      {
        "node_id": 100,
        "floor_id": 5,
        "name_th": "ทางเดิน 5_02",
        "name_eng": "Hallway 5_02",
        "type": "hallway",
        "lng": 100.513604083293,
        "lat": 13.8212477351862
      },
      {
        "node_id": 109,
        "floor_id": 5,
        "name_th": "ทางเดิน 5_03",
        "name_eng": "Hallway 5_03",
        "type": "hallway",
        "lng": 100.513453051292,
        "lat": 13.8213474294616
      },
      {
        "node_id": 119,
        "floor_id": 5,
        "name_th": "ทางเดิน 5_04",
        "name_eng": "Hallway 5_04",
        "type": "hallway",
        "lng": 100.513279037229,
        "lat": 13.8214638468919
      },
      {
        "node_id": 120,
        "floor_id": 5,
        "name_th": "ทางเดิน 5_05",
        "name_eng": "Hallway 5_05",
        "type": "hallway",
        "lng": 100.513336349631,
        "lat": 13.8215450654677
      },
      {
        "node_id": 126,
        "floor_id": 6,
        "name_th": "ทางเดิน 6_01",
        "name_eng": "Hallway 6_01",
        "type": "hallway",
        "lng": 100.513716164089,
        "lat": 13.8211778296744
      },
      {
        "node_id": 129,
        "floor_id": 6,
        "name_th": "ทางเดิน 6_02",
        "name_eng": "Hallway 6_02",
        "type": "hallway",
        "lng": 100.513610293658,
        "lat": 13.8212436692146
      },
      {
        "node_id": 140,
        "floor_id": 6,
        "name_th": "ทางเดิน 6_03",
        "name_eng": "Hallway 6_03",
        "type": "hallway",
        "lng": 100.513444952277,
        "lat": 13.8213474822864
      },
      {
        "node_id": 150,
        "floor_id": 6,
        "name_th": "ทางเดิน 6_04",
        "name_eng": "Hallway 6_04",
        "type": "hallway",
        "lng": 100.513277700492,
        "lat": 13.8214593145733
      },
      {
        "node_id": 151,
        "floor_id": 6,
        "name_th": "ทางเดิน 6_05",
        "name_eng": "Hallway 6_05",
        "type": "hallway",
        "lng": 100.513328812441,
        "lat": 13.8215316403966
      },
      {
        "node_id": 99,
        "floor_id": 5,
        "name_th": "505",
        "name_eng": "505",
        "type": "room",
        "lng": 100.513661268074,
        "lat": 13.8211977784788
      },
      {
        "node_id": 101,
        "floor_id": 5,
        "name_th": "508",
        "name_eng": "508",
        "type": "room",
        "lng": 100.513603442354,
        "lat": 13.8212621564434
      },
      {
        "node_id": 102,
        "floor_id": 5,
        "name_th": "509",
        "name_eng": "509",
        "type": "room",
        "lng": 100.513579689906,
        "lat": 13.8212786687525
      },
      {
        "node_id": 103,
        "floor_id": 5,
        "name_th": "513",
        "name_eng": "513",
        "type": "room",
        "lng": 100.513501806098,
        "lat": 13.8213325598686
      },
      {
        "node_id": 104,
        "floor_id": 5,
        "name_th": "515",
        "name_eng": "515",
        "type": "room",
        "lng": 100.513447834972,
        "lat": 13.8213663333581
      },
      {
        "node_id": 105,
        "floor_id": 5,
        "name_th": "519",
        "name_eng": "519",
        "type": "room",
        "lng": 100.513362848742,
        "lat": 13.8214210104166
      },
      {
        "node_id": 106,
        "floor_id": 5,
        "name_th": "521",
        "name_eng": "521",
        "type": "room",
        "lng": 100.513310226369,
        "lat": 13.8214559452714
      },
      {
        "node_id": 107,
        "floor_id": 5,
        "name_th": "523",
        "name_eng": "523",
        "type": "room",
        "lng": 100.513231306786,
        "lat": 13.8215075407355
      },
      {
        "node_id": 108,
        "floor_id": 5,
        "name_th": "526",
        "name_eng": "526",
        "type": "room",
        "lng": 100.513178152549,
        "lat": 13.8215421345801
      },
      {
        "node_id": 110,
        "floor_id": 5,
        "name_th": "บันได_ชั้น 5_01",
        "name_eng": "Stair_level 5_01",
        "type": "stair",
        "lng": 100.51360526623,
        "lat": 13.8211780407101
      },
      {
        "node_id": 121,
        "floor_id": 5,
        "name_th": "บันได_ชั้น 5_02",
        "name_eng": "Stair_level 5_02",
        "type": "stair",
        "lng": 100.513349500341,
        "lat": 13.8215595960861
      },
      {
        "node_id": 130,
        "floor_id": 6,
        "name_th": "บันได_ชั้น 6_01",
        "name_eng": "Stair_level 6_01",
        "type": "stair",
        "lng": 100.513606006229,
        "lat": 13.8211802962846
      },
      {
        "node_id": 152,
        "floor_id": 6,
        "name_th": "บันได_ชั้น 6_02",
        "name_eng": "Stair_level 6_02",
        "type": "stair",
        "lng": 100.51334241567,
        "lat": 13.8215481011538
      },
      {
        "node_id": 114,
        "floor_id": 5,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 5_01",
        "name_eng": "Toilet_M_level 5_01",
        "type": "room",
        "lng": 100.513532385729,
        "lat": 13.8212250512128
      },
      {
        "node_id": 122,
        "floor_id": 5,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 5_02",
        "name_eng": "Toilet_M_level 5_02",
        "type": "room",
        "lng": 100.513331200861,
        "lat": 13.8215714981244
      },
      {
        "node_id": 134,
        "floor_id": 6,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 6_01",
        "name_eng": "Toilet_M_level 6_01",
        "type": "room",
        "lng": 100.513533297768,
        "lat": 13.8212256912494
      },
      {
        "node_id": 153,
        "floor_id": 6,
        "name_th": "ห้องน้ำ_ชาย_ชั้น 6_02",
        "name_eng": "Toilet_M_level 6_02",
        "type": "room",
        "lng": 100.513322738289,
        "lat": 13.8215591329393
      },
      {
        "node_id": 112,
        "floor_id": 5,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 5_01",
        "name_eng": "Toilet_F_level 5_01",
        "type": "room",
        "lng": 100.513573078842,
        "lat": 13.8211995622162
      },
      {
        "node_id": 123,
        "floor_id": 5,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 5_02",
        "name_eng": "Toilet_F_level 5_02",
        "type": "room",
        "lng": 100.513313145562,
        "lat": 13.8215838108496
      },
      {
        "node_id": 132,
        "floor_id": 6,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 6_01",
        "name_eng": "Toilet_F_level 6_01",
        "type": "room",
        "lng": 100.513572693049,
        "lat": 13.8212012888533
      },
      {
        "node_id": 154,
        "floor_id": 6,
        "name_th": "ห้องน้ำ_หญิง_ชั้น 6_02",
        "name_eng": "Toilet_F_level 6_02",
        "type": "room",
        "lng": 100.513304905107,
        "lat": 13.8215700572349
      }
];