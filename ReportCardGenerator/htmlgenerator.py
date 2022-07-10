import xml.etree.ElementTree as ET
import time

xml = ET.parse("TestIResults.xml")
r = xml.getroot()

html = ET.fromstring("<html></html>")
head = ET.SubElement(html, "head")
headmeta = ET.SubElement(head, "meta")
headmeta.set("charset", "UTF-8")
headtitle = ET.SubElement(head, "title")
headlink = ET.SubElement(head, "link")
headlink.set("rel", "stylesheet")
headlink.set("href", "../Mulliganaceous2.css")
ET.dump(html)
body = ET.SubElement(html, "body")

resultstable = ""

# Section
for section in r:
    # Student
    for student in section:
        # Set Student
        title = ET.SubElement(body, "h1")
        
        title.text = "Marilake M7 Exam II Results"
        subtitle = ET.SubElement(title, "st")
        subtitle.text = "{0:s}, {1:s}".format(student.attrib["lastname"], student.attrib["firstname"])
        if student.attrib["username"] != "":
            subtitle.text = "{0:s}, {1:s} ({2:s})".format(student.attrib["lastname"], student.attrib["firstname"], student.attrib["username"])
        headtitle.text = "{},{}_Exam_II_Results".format(student.attrib["lastname"], student.attrib["firstname"])
        resulttitle = ET.SubElement(body, "h2")
        resulttitle.text = "Results"
        resulttext = ET.SubElement(body, "p")
        resultnotes = ET.SubElement(body, "p")
        notestitle = ET.SubElement(body, "h2")
        notestitle.text = "Notes"
        resultstable += student.attrib["lastname"] + "\t" + student.attrib["firstname"]
        print(student.attrib)
        # Set Score
        score = 0
        scoreadj = 0
        outof = 0
        submissiontype = ""
        submissionnotes = ""
        page = 1
        for notes in student:
            qtitle = None
            if notes.tag == "question":
                qscore = -1
                if int(notes.attrib["page"]) != page:
                    page = page + 1
                    ET.SubElement(body, "newpage")
                if notes.attrib["grade"].lstrip("-").isdecimal():
                    qscore = int(notes.attrib["grade"])/int(notes.attrib["outof"])
                    score += int(notes.attrib["grade"])
                outof += int(notes.attrib["outof"])

                qtitle = ET.SubElement(body, "h3")
                qtitle.text = notes.attrib["name"]
                qnotes = ET.SubElement(body, "p")
                qnotes = ET.SubElement(qnotes, "b")
                if qscore >= 1:
                    qnotes.set("style","color:green")
                qnotes.text = "({0:s} / {1:s})".format(notes.attrib["grade"],notes.attrib["outof"])
                qnotes = ET.SubElement(body, "p")
                qnotes.text = notes.text.strip()
                print("\t" + str(notes.attrib) + " " + "({0:2.0f}%) ".format(qscore*100) + notes.text.strip())
            elif notes.tag == "submission":
                if notes.attrib["grade"].lstrip("-").isdecimal():
                    scoreadj = int(notes.attrib["grade"])
                else:
                    scoreadj = 0
                submissiontype = notes.attrib["type"]
                submissionnotes = notes.text.strip()
                print("\t" + str(notes.attrib))
                print("\t" + submissionnotes)
            resultstable += "\t" + notes.attrib["grade"] + " "

        # Overall score
        resulttext.text = "You have scored a {0:d} out of {1:d}. ".format(score, 100)
        print(">>{0:d}".format(scoreadj))
        if scoreadj != 0:
            resulttext.text += "Adjusting for submission notes, you have a {0:d}.".format(score + scoreadj)
        if submissiontype != "":
            resultnotes.text = "This submission is a {0:s}. ".format(submissiontype)
        else:
            resultnotes.text = ""
        resultnotes.text += submissionnotes
        print("{0:d}/{1:d} {2:s}, {3:s}".format(score, outof, submissiontype, submissionnotes))
        resultstable += "\t" + str(score) + "\t" + str(score + scoreadj) + "\n"

        g = open("Section{2:s}/TestIResults;{0:s},{1:s}.html".format(student.attrib["lastname"], student.attrib["firstname"], section.attrib["id"]), "w")
        g.write(ET.tostring(html, encoding="UTF-8").decode("UTF-8"))
        body.clear()
        g.close()
        time.sleep(1)

print(resultstable)
