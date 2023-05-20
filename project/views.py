from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render


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
    
from .forms import InputForm


def add(request):
    form = InputForm()

    if request.method == "POST":
        form = InputForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            x = cd['x']
            y = cd['y']
            z = x + y
            return render(request, 'layouts/addition.html', {'form': form, 'output': z})

    return render(request, 'layouts/addition.html', {'form': form, 'output': 0})

from .forms import InputForm
from django.shortcuts import render

def performarithmetic(request):
    y = 1
    x=1
    form = InputForm()
    if request.method == "POST":
        form = InputForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            x = cd['x']
            y = cd['y']
    return render(request, "layouts/arithmetic.html", {
        "form": form,
        "x": x,
        "y": y,
        "r1": x + y,
        "r2": x - y,
        "r3": x * y,
        "r4": x / y,
        "r5": x * y,
    })

from .forms import PrimeForm
from .primeTest import isPrime

def prime(request):
    b = False
    form = PrimeForm()
    
    if request.method == "POST":
        form = PrimeForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            x = cd['x']
            b = isPrime(x)
    
    if b == False:
        m = "This number is not Prime"
    else:
        m = "This number is Prime"
    
    return render(request, 'layouts/prime.html', {'form': form, 'output': m})


from .forms import WorldcupForm
import random
def worldcup(request):
    form = WorldcupForm()
    m = ''  # Initialize 'm' with a default value
    
    if request.method == "POST":
        form = WorldcupForm(request.POST)
        
        if form.is_valid():
            cd = form.cleaned_data
            x = cd['countries']
            y = x.split(' ')
            
            for i in range(int(len(y) / 2)):
                z = random.sample(y, k=2)
                for j in z:
                    y.remove(j)
                m += z[0] + 'X' + z[1] + '\n'
    
    return render(request, 'layouts/worldcup.html', {'form': form, 'output': m})


def testview(request):
    return render(request, 'layouts/test.html')


