terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {
  host     = "ssh://ssh.magic8.club"
}

resource "docker_network" "this" {
  name = "magic8club"
}

resource "docker_volume" "this" {
  name = "magic8club"
}

resource "docker_image" "magic8club-proxy" {
  name = "magic8club-proxy"
  build {
    context = "proxy"
    tag     = ["magic8club-proxy"]
  }
}

resource "docker_image" "magic8club-server" {
  name = "magic8club-server"
  build {
    context = "server"
    tag     = ["magic8club-server"]
  }
}

resource "docker_image" "magic8club-client" {
  name = "magic8club-client"
  build {
    context = "client"
    tag     = ["magic8club-client"]
  }
}

resource "docker_container" "magic8club-proxy" {
  depends_on = [docker_container.magic8club-client, docker_container.magic8club-server]

  name  = "magic8club-proxy"
  image = docker_image.magic8club-proxy.image_id

  networks_advanced {
    name = docker_network.this.id
  }

  ports {
    internal = 80
    external = 5050
  }
}

resource "docker_container" "magic8club-server" {
  name  = "magic8club-server"
  image = docker_image.magic8club-server.image_id

  networks_advanced {
    name = docker_network.this.id
  }

  volumes {
    container_path = "/app/data"
    volume_name = docker_volume.this.id
  }

  hostname = "magic8server"
}

resource "docker_container" "magic8club-client" {
  name  = "magic8club-client"
  image = docker_image.magic8club-client.image_id

  networks_advanced {
    name = docker_network.this.id
  }

  hostname = "magic8client"
}