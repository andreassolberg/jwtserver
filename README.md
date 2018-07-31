# JWT Server




Build

```
docker build -t andreassolberg/jwtserver .
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
