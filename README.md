# JWT Server



Build

```
docker build -t andreassolberg/jwtserver -t v1.0.2 .
docker push andreassolberg/jwtserver
```

Setup

```
kubectl apply -f deployment.yaml
```

Clean up
```
kubectl delete deployments jwtserver-localhost jwtserver-ntnu
kubectl delete services jwtserver-localhost jwtserver-ntnu
```


Restart, and load new version:

```
kubectl delete deployments jwtserver-localhost jwtserver-ntnu
kubectl apply -f deployment.yaml
```
