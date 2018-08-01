# JWT Server


A proof of concept implementation of a service that implements webfinger and serves as a JWT Federation entity.

**DEMO ONLY**

Demo certificates including private keys included.

Automatically published to

* <https://hub.docker.com/r/andreassolberg/jwtserver>


Setup

```
kubectl apply -f deployment.yaml
```

Clean up
```
kubectl delete deployments jwtserver-application jwtserver-ntnu
kubectl delete services jwtserver-application jwtserver-ntnu
```


Restart, and load new version:

```
kubectl delete deployments jwtserver-application jwtserver-ntnu jwtserver-feide jwtserver-edugain
kubectl apply -f deployment.yaml
```
