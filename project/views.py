from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

def hello_world(request):
 return HttpResponse('<div style="background-color: aquamarine; color: brown; border: 4px solid black; margin: 15px; text-align: center; width: 300px;">Hello from Django</div>')

@csrf_exempt
def addxy(request):
    if request.method == "POST":
        x = int(request.POST.get('firstvalue'))
        y = int(request.POST.get('secondvalue'))
        z = x + y
        return HttpResponse(str(z))

    else:
        return HttpResponse('''
            <form action="/addtwonumbers/" method="POST">
                <p></p>
                <p>
                    <label for="firstvalue">Enter first number</label>
                    <input type="text" name="firstvalue" />
                </p>
                <p>
                    <label for="secondvalue">Enter second number</label>
                    <input type="text" name="secondvalue" />
                    <button type="submit">ADD</button>
                </p>
            </form>
        ''')