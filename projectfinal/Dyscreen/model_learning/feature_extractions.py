#This model will also a count for other things such :
#building Core model Performance metrics.
#Feature extrqaction for diagnosic Context- trying to get data we can show the user later.
#using STA,HWR AND SemA


#Logic for forging line and Baseline Detection.




from operator import le
import matplotlib
matplotlib.use("Agg") 
import cv2
import numpy as np

import matplotlib.pyplot as plt

#space between words.

def calculate_word_spaces(word_boxes,line_tolerance =25):
    #sort by vertical position
    word_boxes = sorted(word_boxes, key=lambda b: (b[1], b[0]))

    lines = []

    #Group words into text lines
    for box in word_boxes:
        w,y,w,h = box 
        center_y = y + h//2

        added =False
        for line in lines:
            line_center_y = np.mean([b[1] + b[3] // 2 for b in line]) #get the avg center

            if abs(center_y - line_center_y) < line_tolerance:
                line.append(box)
                added = True
                break
        if not added:
            lines.append([box])
    spaces = []

    #Cal gaps inside each line 
    for line in lines:
        line = sorted(line,key=lambda b: b[0]) 

        for i in range(len(line)-1):
            x1,y1,w1,h1 = line[i]
            x2,y2,w2,h2 = line[i+1]

            gap = x2 - (x1 + w1)  
            
            if gap >0:
                spaces.append({
                    "gap":gap,
                    "from_word": line[i],
                    "to_word": line[i+1],
                    "line_y":y1
                })
    return spaces

def merge_close_lines(lines, min_distance=20):
    if not lines:
        return []

    lines = sorted(lines)
    merged = [lines[0]]

    for y in lines[1:]:
        if abs(y - merged[-1]) <= min_distance:
            merged[-1] = int((merged[-1] + y) / 2)
        else:
            merged.append(y)

    return merged


# def detect_word_boxes(img): # pervios version
#     _, binary = cv2.threshold(
#         img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
#     )

#     # Connect letters into word-like blobs
#     kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 8))
#     dilated = cv2.dilate(binary, kernel, iterations=1)

#     contours, _ = cv2.findContours(
#         dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
#     )

#     word_boxes = []

#     area = w*h
#     for cnt in contours:
#         x, y, w, h = cv2.boundingRect(cnt)

#         # remove small noise
#         if w > 12 and h > 8 and area > 100:
#             word_boxes.append((x, y, w, h))

#     return word_boxes

def detect_word_boxes(img):
    _, binary = cv2.threshold(
        img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (18, 6))
    dilated = cv2.dilate(binary, kernel, iterations=1)

    contours, _ = cv2.findContours(
        dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    word_boxes = []

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h

        if w > 25 and h > 18 and area > 500:
            word_boxes.append((x, y, w, h))

    return sorted(word_boxes, key=lambda b: (b[1], b[0]))


def get_horizontal_projection(image_path,output_path="line_check.jpg"):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if img is None or img.size == 0:
        print("Error: image not found or empty")
        return None, None, 0

    _, binary = cv2.threshold(
        img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    hpp = np.sum(binary, axis=1)

    plt.figure(figsize=(10, 5))
    plt.plot(hpp)
    plt.title("Horizontal Projection Profile - Density Check")
    plt.savefig("my_plot.png")
    plt.close()

    line_threshold = np.max(hpp) * 0.4
    rows, cols = img.shape

    check_img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    raw_lines = []
    for i, val in enumerate(hpp):
        if val > line_threshold:
            raw_lines.append(i)

    merged_lines = merge_close_lines(raw_lines, min_distance=10)

    overlay = check_img.copy()
    

    UNDER_THRESHOLD = 20
    ABOVE_THRESHOLD = 50

    # for y in merged_lines:
    #     cv2.line(overlay, (0, y), (cols, y), (0, 0, 255), 2)
    for line_y in merged_lines:
       

        # upper threshold
       # cv2.line(overlay, (0, line_y - ABOVE_THRESHOLD), (cols, line_y - ABOVE_THRESHOLD), (255, 255, 0), 3)

        # lower threshold
        cv2.line(overlay, (0, line_y + UNDER_THRESHOLD), (cols, line_y + UNDER_THRESHOLD), (0, 255, 10), 3)
    

    alpha = 0.4
    result = cv2.addWeighted(overlay, alpha, check_img, 1 - alpha, 0)


    avg_space = 0
    word_boxes = detect_word_boxes(img)
    spaces = calculate_word_spaces(word_boxes)
    
    if len(spaces) > 0:
            avg_space = np.mean([s["gap"] for s in spaces])
    
    
    print("Average space between words:", avg_space)
    large_gap_count = 0
    for s in spaces:
        gap = s["gap"]

        if gap > avg_space * 1.3:

            large_gap_count += 1

            x1, y1, w1, h1 = s["from_word"]
            x2, y2, w2, h2 = s["to_word"]

            mid_y = y1 + h1 // 2

            cv2.line(
                result,
                (x1 + w1, mid_y),
                (x2, mid_y),
                (0, 0, 255),
                2
            )

            cv2.putText(
                result,
                str(gap),
                ((x1 + w1 + x2) // 2, mid_y - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 255),
                1
            )


    count_under_lines = 0
    count_above_lines = 0
    count_normal_lines = 0

    for x, y, w, h in word_boxes:
        word_top = y
        word_bottom = y + h
        word_center_y = y + h // 2

        # find nearest detected line for this word
        closest_line = min(
            merged_lines,
            key=lambda line_y: abs(word_center_y - line_y)
        )


        # word is below baseline
        is_under_line = word_bottom > closest_line + UNDER_THRESHOLD

        # word is above baseline
        is_above_line = word_top < closest_line - ABOVE_THRESHOLD

        if is_above_line:
            count_above_lines += 1
            cv2.rectangle(result, (x, y), (x + w, y + h), (255, 0, 0), 2)  # blue

        elif is_under_line:
            count_under_lines += 1
            cv2.rectangle(result, (x, y), (x + w, y + h), (0, 255, 255), 2)  # yellow
        else:
            count_normal_lines += 1
            cv2.rectangle(result, (x, y), (x + w, y + h), (0, 0, 255), 2)

        
    cv2.imwrite(output_path, result)

    print("Detected lines:", len(merged_lines))
    print("Detected word boxes:", len(word_boxes))
    print("blue Words under lines:", count_under_lines)
    print("yellow Words above lines:", count_above_lines)
    print("normal Words:", count_normal_lines)
    print("Total Words:", count_under_lines + count_above_lines + count_normal_lines)
    print("Amount of Spaces between words:", len(spaces))
    print("Words spaces that are above average:", large_gap_count)

    return hpp, merged_lines, count_under_lines, count_above_lines


def extractions(file_path,output_path="line_detection_check.jpg"):
    return get_horizontal_projection(file_path, output_path=output_path)
    
     


# print("\nTesting on low potential image:")
# get_horizontal_projection(pos_dys)



